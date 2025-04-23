## Player app for pintomind-os

## Utviklerverktøy

Vi har laget noen verktøy for å gjøre utvikling av app lettere når en kjører en pi i det lokale nettverket.

Disse er alle basert på ssh tilgang så det enkleste er å sette opp pi'en med en utvikler versjon av PinToMind pi OS.

### Finne riktig IP
For å finne alle pi'er på det lokale nettverket kan du kjøre

`npm run scan`
 
Når dette er gjort kan du på alle kommandoene legge inn `-- <IP>` for å si hvilken enhet du vil gå til.

F.eks: `npm run ssh -- 10.0.0.123`

Du kan også automatisk bruke den første pi'en som du finner på nettverket, 
det kan være praktisk om du vet at du bare har en. Dette gjør du med å legge på `-- scan`

F.eks `npm run ssh -- scan`

Den siste ip'en du brukte vil bli lagret i `scripts/last_ip_address.txt` så du slipper å skrive inn ip på nytt hver gang

### Tilgjengelige verktøy


For å bygge og publisere ny versjon av app'en til pi'en kan du kjøre

`npm run build_and_publish`

For å lese vår logger kan du kjøre

`npm run log`

For å logge inn på enheten skriver du

`npm run ssh`
