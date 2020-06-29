+++
title = "Sampling"
aliases = [
  "/guides/sampling/",
  "/getting-data-in/sampling/",
  "/working-with-your-data/tracing/sampling/"
]
weight = 220
description = "Sampling data to reduce costs and speed queries"

+++

Sampling is the concept of selecting a few elements from a large collection and learning about the entire collection by extrapolating from the selected set. It's widely used throughout the world whenever trying to tackle a problem of scale: for example, a survey assumes that by asking a small group of people a set of questions, you can learn something about the opinions of the entire populace.

While it's nice to believe that every event is precious, the reality of monitoring high volume production infrastructure is that there are some attributes to events that make them more interesting than the rest. Failures are often more interesting than successes! Rare events are more interesting than common events! Capturing some traffic from all customers can be better than capturing all traffic from some customers.

Honeycomb is sample-native - every event has a sample rate riding along with it, meaning we can inflate that sampled event correctly in our backend. This gives you the flexibility to use sampling algorithms as simple as "one in every 5 events" or as complex as dynamically adjusting your sample rate on a per-customer, per-response-code, or per-whatever-is-important basis. (Or some combination of all of those!)

Sampling as a basic technique for instrumentation is no different&mdash;by recording information about a representative subset of requests flowing through a system, you can learn about the overall performance of the system. And as with surveys and air monitoring, the way you choose your representative set (the sample set) can greatly influence the accuracy of your results.

This guide explores various sampling techniques for situations of varying complexity.

## Should I sample my traffic?

* If you have &lt; 10 events per second, don't sample. Otherwise, consider it
* If you decide to sample, think about the characteristics in your traffic that you want to preserve and use those fields to guide your sample rate (might be success/error or customer ID or endpoint or ...)
* Aim for the sampled traffic to be between 10eps and 1000eps

Beyond that, allow cost and resolution to determine your optimal sample rate&mdash;the higher your resolution, 
the higher your cost for a given retention period.

## Calculating with Sampled Data

Sending the sample rate along with an event allows the Honeycomb backend to understand how your data is sampled. For example, if you send in a single transmitted event with `SampleRate = 8`, Honeycomb understands that represents 8 similar events, and so should be inflated 8x in any analytical computation.  Within Honeycomb, every event has an associated sample rate; all the calculations used to visualize your data correctly handle these variable sample rates.

<a name="reweighted-samples"></a>
When you query Honeycomb with sampled data, the results will be returned _reweighted_ appropriately. Results will be multiplied out as if there were as many rows of the data as there are samples. 

For example, consider two events transmitted to Honeycomb's API with the following structure:

| Timestamp | Sample Rate | duration_ms
| --------- | ----------- | -----------
| 05-05 01:02 | 8 | 2
| 05-05 01:03 | 1 | 11

An overall `COUNT` on this dataset will return `9`--`8` events from the first, `1` event from the second. An overall `AVG(duration_ms)` will return `3`, the result of expanding the first event by its sample rate `((2*8 + 11*1) / (8 + 1)) = 3`. Visual graphs -- including the `COUNT` and `SUM` and percentile computations -- will be correctly reweighted for the sample rate.

Because Honeycomb does this reweighting on each event, it's entirely safe to have a different sample rate even for _each event_ in the dataset. This enables [dynamic sampling](#dynamic-sampling).

To run calculations against the sample rate itself, team owners can use the Usage Center's ["Explore Sample Rates"](/working-with-your-data/managing-your-data/usage-center#exploring-the-sample-rate) feature.

## Constant sampling

The simplest approach to sampling is to capture a constant, random subset of events in the requests. In the example below, we use the Honeycomb SDK to capture a random 25% (or 1 in 4) of incoming HTTP requests:

{{< code-toggle-wrapper id="constant" tabs="go,ruby" >}}
  {{% code-toggle-content tab="go" active="true" %}}
```go
func handleRequest(w http.ResponseWriter, r *http.Request) {
  // do work...

  // This event should have a 1/4 chance of being transmitted, and Honeycomb's
  // servers should undestand that this event represents 4 similar events.
  event.SampleRate = 4
  event.Send()
  w.WriteHeader(http.StatusOK)
}
```
  {{% /code-toggle-content %}}
  {{% code-toggle-content tab="ruby" %}}
```ruby
def call(env)
  # do work, build up libhoney event with parameters
  status, headers, response := @app.call(env)
  # ...

  # This event should have a 1/4 chance of being transmitted, and Honeycomb's
  # servers should undestand that this event represents 4 similar events.
  event.sample_rate = 4
  event.send

  [ status, headers, response ]
end
```
  {{% /code-toggle-content %}}
{{< /code-toggle-wrapper >}}

Note that we rely on our Honeycomb SDK to do the selective transmission of sampled events. If we weren't using a Honeycomb SDK, this logic might instead look something like:

{{< code-toggle-wrapper id="without-libhoney" tabs="go,ruby" >}}
  {{% code-toggle-content tab="go" active="true" %}}
```go
var numReqs int
func handleRequest(w http.ResponseWriter, r *http.Request) {
  // do work
  if rand.Intn(4) == 0 { // if using a Honeycomb SDK, setting a SampleRate and
    numReqs += 4         // calling Send() will do the right thing.
    fmt.Println(`{"num_requests":%d}`, numReqs)
  }
  w.WriteHeader(http.StatusOK)
}
```
  {{% /code-toggle-content %}}
  {{% code-toggle-content tab="ruby" %}}
```ruby
def call(env)
  # do work

  if rand(r) == 0 # if using a Honeycomb SDK, setting a sample_rate and
    num_reqs += 4 # calling .send() will do the right thing.
    puts "{'num_requests':#{ num_reqs }}"
  end
  [ status, headers, response ]
end
```
  {{% /code-toggle-content %}}
{{< /code-toggle-wrapper >}}

**Advantages**: It is simple and easy to implement. You can easily reduce the load on your analytics system by only sending one event to represent many, whether that be one in every four, hundred, or ten thousand events.

**Disadvantages**: Constant sampling is inflexible. Once you've chosen your sample rate, it is fixed. If your traffic patterns change or your load fluctuates, the sample rate may be too high for some parts of your system (missing out on important, low-frequency events) and too low for others (sending lots of homogenous, extraneous data).

**Summary**: Constant sampling is the **best choice** when your traffic patterns are homogeneous and constant. If every event provides equal insight into your system, than any event is as good as any other to use as a representative event. The simplicity allows you to easily cut your volume.

## Dynamic sampling

The final step in a truly dynamic sampling setup is to build in server logic to identify a key for each incoming event, then dynamically adjust the sample rate based on the volume of traffic for that key. Because Honeycomb reweights sampled data for its computations, it's feasible to have a different sample rate for _each event_ in the dataset.

In all the following examples, the key used to determine the sample rate can be as simple (e.g. HTTP status code or customer ID) or complicated (e.g. concatenating the HTTP method, status code, and user-agent) as is appropriate to select samples that can give you the most useful view into the traffic possible.

A dataset owner can monitor the state of their dynamic sampling using the usage center's ["Explore Sample Rate"](/working-with-your-data/managing-your-data/usage-center#exploring-the-sample-rate) feature.

### Static map of sample rates

Building a static map of traffic type to sample rate is the our first method for doing dynamic sampling.
We can define a simple heuristic mapping a few different types of events each to their own sample rate.

**For example:** when recording HTTP events, we may care about seeing every server error but need less resolution when looking at successful requests. We can then set the sample rate for successful requests to 100 (storing one in a hundred successful events). We include the sample rate along with each event&mdash;100 for successful events and 1 for error events.

{{< code-toggle-wrapper id="static-map" tabs="go,ruby" >}}
  {{% code-toggle-content tab="go" active="true" %}}
```go
func handleRequest(w http.ResponseWriter, r *http.Request) {
  // do work
  if status == http.StatusBadRequest || status == http.StatusInternalServerError {
    logRequest(r, 1)              // track every single bad or errored request
  } else if rand.Intn(100) == 0 {
    logRequest(r, 100)            // track 1 out of every 100 successful requests
  }
  w.WriteHeader(status)
}
```
  {{% /code-toggle-content %}}
  {{% code-toggle-content tab="ruby" %}}
```ruby
def call(env)
  # do work, build up libhoney event with parameters
  status, headers, response := @app.call(env)
  # ...
  if status >= 400
    log_request(env, 1)   # track every single bad or errored request
  else if rand(100) == 0
    log_request(env, 100) # track 1 out of every 100 successful requests
  end
  [ status, headers, response ]
end
```
  {{% /code-toggle-content %}}
{{< /code-toggle-wrapper >}}

By choosing the sample rate based on an aspect of the data that we care about, we're able to gain more flexible control over both the total volume of data we send to our analytics system and the resolution we get looking into interesting times in our service history.

**Advantages**: You gain flexibility in determining which types of events are more important for you to examine later, while retaining an accurate view into the overall operation of the system.

When *errors* are more important than *successes*, or *slow queries* are more important than *fast queries*, you now have a method to manage the volume of data you send in to your analytics system while still gaining detailed insight into the portions of the traffic you really care about.

**Disadvantages**: If there are too many different types of traffic, enumerating them all to set a specific sample rate for each can be difficult.
Also, if you don't know ahead of time which types might be important, it can be difficult to create a static map of event attributes to sample rates.
And finally, if traffic types change their importance over time, this method can not easily change to accommodate that.

This method is the **best choice** when your traffic has a few well known characteristics that define a limited set of types, and some types are obviously more interesting for debugging than others. Some common patterns for using a static map of sample rates are HTTP status codes, error status, top tier customer status, and known traffic volume.

For a concrete example of this method, take a look at the [logstash documentation](/getting-data-in/integrations/log-collectors/logstash/) or a [sample logstash config](https://gist.github.com/maplebed/3f04bd300302de36f4aa0f44b4d57439) using dynamic sampling based on HTTP status code.

### Average sample rate

We'll get a little fancier with this method. The goal for this strategy is achieve a given overall sample rate across all traffic. However, we want to capture more of the infrequent traffic to retain high fidelity visibility. We accomplish both these goals by increasing the sample rate on high volume traffic and decreasing it on low volume traffic such that the overall sample rate remains constant. This gets us the best of both worlds - we catch rare events and still get a good picture of the shape of frequent events.

**For example:** say we want to aim for an overall sample rate of 20. To achieve this, we'll sum up the total amount of traffic seen, across all keys, then divide by the target rate: `(900+90+10) / 20 = 50` directs us to aim for a total of 50 Honeycomb sample events.

We then give each key an equal portion of the total number of events to send (each of the three keys should transmit `50 / 3 = 17` events), and work backwards to determine what the sample rate should be. In the table below, key `a`, with its 900 events, should select one out of every `900 / 17 = 52` events to represent its incoming traffic in Honeycomb.

Here is the same table we used in the two previous examples, with the `target events sent` and `sample rate` columns swapped to communicate the inverse order of our calculations:

|key	|traffic	|target events sent	|sample rate|
|------|------|-----|-----|
|a|	900|	17 | 52|
|b|	90|	18|	5|
|c|	10|	10|	1|

`Average sample rate target: retain 1 out of every 20 events`

**Advantages**: When rare events are more interesting than common events, and the volume of incoming events across the key spectrum is wildly different, the average sample rate is an excellent choice. Picking just one number (the target sample rate) is as easy as constant sampling but you magically get wonderful resolution into the long tail of your traffic while still keeping your overall traffic volume manageable.

**Disadvantages**: High volume traffic is sampled very aggressively.

**Summary**: At Honeycomb we apply one additional twist to the Average Sample Rate method. The description above weights all keys equally. But shouldn't high volume keys actually have more representation than low volume keys? We choose a middle ground by using the logarithm of the count per key to influence how much of the total number of events sent into Honeycomb are assigned to each key—a key with `10^x` the volume of incoming traffic will have `x` times the representation in the sampled traffic.

For more details, take a look at the implementation for the average sample rate method [linked below](#open-source).

### Average sample rate with minimum per key

To really mix things up, let's combine two methods! Since we're choosing the sample rate for each key dynamically, there's no reason we can't also choose which method we use to determine that sample rate dynamically!

One disadvantage of the **average sample rate** method is that if you set a high target sample rate but have very little traffic, you will ultimately over-sample traffic you could actually send with a lower sample rate. For example, consider setting a target sample rate of 50 but then only actually having 30 events total; there's no need to sample so heavily when you have very little traffic. So what should you do when your traffic patterns are such that one method doesn't always fit? Use two!

* When your traffic is below 1,000 events per 30 seconds, don't sample.
* When you exceed 1,000 events during your 30 second sample window, switch to **average sample rate** with a target sample rate of 100.

By combining different methods, you mitigate each of their disadvantages and keep full detail when you have the capacity, and gradually drop more of your traffic as volume grows.

## Open source

We've implemented the sampling methods mentioned here as an open sourced Go library (`dynsampler-go`), Apache 2.0 licensed. Its source is on [GitHub](https://github.com/honeycombio/dynsampler-go). We would love additional methods of sampling as contributions!
