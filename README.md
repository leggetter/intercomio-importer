# Intercom.io Import

Used to import some data from CSV files. If the user already exists (identfied by a `user_id` field) then the user is updated with the data from the CSV.

It's not a particularly generic solution, but it does demonstrate how easy it is to interact with the [intercom.io API](https://api.intercom.io/docs) using the [intercom.io Node library](https://github.com/tarunc/intercom.io).

## Dev Notes

### config.json

A `config.json` file is expected to be present. It should be in the following format:

```
{
  "intercom": {
    "apiKey": "YOUR_INTERCOMIO_API_KEY",
    "appId":  "YOUR_INTERCOMIO_APP_ID"
  },
  "locumCSVPath": "PATH_TO_LOCUM_CSV_FILE",
  "practiceCSVPath": "PATH_TO_PRACTICES_CSV_FILE"
}
```

### Making it generic

The following things are generally useful:

1. Get a list of all existing users
2. Check that as part of the import process that existing users are not duplicated

The following things could be done to make it generic:

1. Remove the reliance on "Locums" and "Practices"
2. There should simply be a way of importing data, mapping it to an intercom.io user structure and checking for duplicates
3. Abstracting the CSV reliance away and just having an ImportedData interface of some kind

