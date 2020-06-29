+++
title = "Organize your data"
weight = 10
description = "Choose good column names and field data types"
+++

## Categorize columns with good names

Large Datasets can quickly come to feel unwieldy. Once you have a Dataset with more than 40 columns or so, use naming conventions to categorize your columns: `http.method`, `http.status`, and `http.url`, for example, or `server.hostname`,
`server.buildnumber`, and so on.

This practice makes columns easier to find in the Honeycomb UI. It also makes it easier for *everyone* on your team to have a shared understanding of a Dataset, sooner. If a column is labeled "status code," for instance, *you* may know what that means, but the next person may not. We recommend choosing good column names as early as possible, such as when you are instrumenting your app and
determining which fields to send with your events.

## Confirm your field data types match your purpose

Check that your data is a good match for the type Honeycomb thinks it is. For example, a field that looks like an integer might actually be a user ID. It wouldn't make sense to round a user ID, which could happen with a large integer value. You should explicitly set a field like this to `string`, either while instrumenting your code or from the Schema page.
