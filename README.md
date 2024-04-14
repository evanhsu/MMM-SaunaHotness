# MMM-SaunaHotness

This is a module for the Magic Mirror framework that periodically checks the temperature of Matt's sauna and reports it here.
This is probably only useful to a very small audience ;)

---

## Usage

Add this to your MagicMirror `config.js`:

    {
        module: "MMM-SaunaHotness",
        position: "top_left",
        header: "Sauna",
        config: {
            updateIntervalMs: 250000, // Optional: Milliseconds between updates; Default: 250000 (5 minutes)
            debug: false // Optional: boolean; Default: false; Setting this to true will output verbose logs
        },
    },
