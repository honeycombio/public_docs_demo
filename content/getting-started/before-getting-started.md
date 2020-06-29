+++
title = "Before getting started"
linktitle = "Before getting started"
description = "Prepare to get the most out of Honeycomb"
hidetoc = true
weight = 5
+++

In order to get the best experience with Honeycomb, we recommend following these steps _**before signing up for a new account**_.

### 1. Choose a service to instrument

Pick a single app or service that you want to instrument to send data to Honeycomb.
You should be able to:

- Run that service in your development environment
- Deploy changes to production (_in a later step, according to your team's processes_)

Instrumenting a production application allows you to make use of Honeycomb's many powerful features and capabilities.

### 2. Discover your integration path

Use one of the following approaches for instrumentation:

- [Beelines](/getting-data-in/beelines/) should be used for apps written in **Go**, **Ruby**, **Python**, or **NodeJS**. Use the beeline for your language to automatically instrument your code.

- [OpenTelemetry](/getting-data-in/open-standards/#opentelemetry) should be used for **C#**, **C++**, **Java**, **Rust**, or **Erlang/Elixir** apps. An exporter that sends data to Honeycomb can be configured for the OpenTelemetry collector.

Don't see your language listed here? The [get your data in](/getting-data-in/) section of our docs has more information on other integrations available.

## First steps

Now that you're ready to instrument your service for observability, follow the steps to [start sending in data](/getting-started/first-steps/).

## Don't see your use case here?

### Other integrations

Visit the [other integrations](/getting-data-in/integrations) section of our docs to learn about other data you can use with Honeycomb, such as structured logs.

### Try using Honeycomb with mock data

If you don't have an application to instrument and deploy, but would like to see what Honeycomb can do for you, we recommend visiting [Honeycomb Play](https://play.honeycomb.io). You can try the guided tutorials or dig around on your own to see what else is possible.

### Learn more before getting started

You can [learn more about observability](/learning-about-observability/) from our docs. You can also reach out to us for help by clicking the chat icon on the bottom right hand corner of this page.
