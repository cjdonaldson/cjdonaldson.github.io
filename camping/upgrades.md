# upgrade Ideas
```mermaid
---
title: RV Shore Power Electical
displayMode: compact
---
graph LR
    AC[Shore Power] --> BP[Breaker Panel]
    BP --> MW[Microwave]
    BP --> WH[Water Heater]
    BP --> CL[Climate Control]
    BP --> CL1[AC / HP]
    BP --> F[AC Loads - sockets]
    BP --> DC[coverter] --> BB0[bus bar] --> FB[Fuse Box]
```
---
---
```mermaid
---
title: RV Battery Control Circuit
 [control inputs; ignition, emergency switch]
 [control inputs; ignition, emergency switch]
---
flowchart LR
    A@{ shape: "comment", label: "Comment" }

    SIG[Start] --> BCC[Bat Ctl]
    HS[Emergency Start] --> BCC

    DC[Convertor] --> BIM[Bat Iso]
              BCC --> BIM --> CB[Chassis Bat]
                      BIM --> HB[Coach Bat]

    BCC --> LS[LR Slide]
    BCC --> BS[BR slide]
    BCC --> AW[Awning]
    BCC --> AR[Artic]
    BCC --> EM[Emergency Start]

    WP[water pump ???]
```
---
---
```mermaid
---
title: RV XXX Electical
---
graph LR
    N[Chassis Battery] --> O[Fuse] --> BB2[bus bar -]

    BB[LiFePO4] --> SW[Switch] --> f2[100A Fuse] --> BM[Battery Monitor] --> BB1[Bus Bar]

    BB2 --> S[Fuse] --> B
    BB2 --> T[DC Loads]

    SP[Solar Power] --> SC[MPPT] --> F1[60A Fuse] --> BB1a[Bus Bar]

    BB2 --> SPO[Seating Power Outlet] --> AA[20 Fuse] --> AB[12V Socket]
    BB2 --> ES[Entertainment System] --> SB[Switch Bar] --> Y[DC/DC Converter 12V to 5V]
```
```mermaid
---
title: RV Original electical
---
graph LR
    AC[Shore Power] --> BP[Breaker Panel]
    BP --> MW[Microwave]
    BP --> WH[Water Heater]
    BP --> CL[Climate Control]
    BP --> CL1[AC / HP]
    BP --> F[AC Loads - sockets]
    BP --> DC[coverter] --> BB0[bus bar] --> FB[Fuse Box]
    N[Chassis Battery] --> O[Fuse] --> BB2[bus bar -]

    BB[LiFePO4] --> SW[Switch] --> f2[100A Fuse] --> BM[Battery Monitor] --> BB1[Bus Bar]

    BB2 --> S[Fuse] --> B
    BB2 --> T[DC Loads]

    BCC[Bat Ctl] --> BIM[Bat Iso] --> CB[Chassis Bat]
                     BIM --> HB[Coach Bat]
              DC --> BIM
    BCC --> DS[Dining Slide]
    BCC --> BS[Bed slide]
    BCC --> AW[Awning]
    BCC --> AR[Artic]
    BCC --> EM[Emergency Start]


    BI[Bat Isolator]

    SP[Solar Power] --> SC[MPPT] --> F1[60A Fuse] --> BB1a[Bus Bar]

    BB2 --> SPO[Seating Power Outlet] --> AA[20 Fuse] --> AB[12V Socket]
    BB2 --> ES[Entertainment System] --> SB[Switch Bar] --> Y[DC/DC Converter 12V to 5V]
```

    K[AC Charger] --> L[Convert to DC] --> M[Fuse] --> J
--- :sunrise_over_mountains: 🌄

```
ac -> breaker panel -> microwave
                    -> water heater
                    -> AC / heat pump
                    ->
solar -> convert -> fuse -> bus bar
ac -> convert -> fuse -> bus bar
chassis battery -> fuse -> bus bar

LiFePO4 battery -> fuse -> shunt -> bus bar

bus bar -> fuse -> breaker panel -> loads

```

### PD4060K - Converter


### BCC - Battery Control Circuit
- Omron G8N-1: SPDP 14V 25A; motor control
- Ignition off (??)
    - [X] J1 F1 Emergency Start Switch 5A
    - [ ] J3 F3 Outside TV
    - [ ] J5 F5 Electric Step
    - [ ] J7 F7 Radio Power
    - [X] J9 F9 Artic Pac 15A
    - [ ] J11 F11 Subwoofer
- Ignition on (except for Awning)
    - [ ] J2 F2 Rear Bedroom slide
    - [X] J4 F4 Living Room slide 20A
    - [ ] J6 F6 Kitchen Slide
    - [X] J8 F8 Bedroom Slide 20A
    - [X] J10 F10 Awning 15A

### Monitor
- 1/0AWG black / red wire
- battery monitor
- bus bar

### Battary Isolator
- It prevents loads in one system from discharging both and connects the two systems while charging.
- The coach battery is charged while driving and the chassis battery is charged when plugged into shore power. The BIM monitors the battery voltage of both the chassis and coach batteries over long periods of time.
- If it senses a charging voltage, it connects the two batteries together. Once the batteries have charged for 1 hour, the BIM will isolate the batteries to prevent overcharging, and only reconnect the batteries if one of the batteries drops to 80% charge.
- Isolates batteries to prevent discharging or overcharging, waterproof.
- The BIM monitors the battery voltage of both the chassis and coach batteries over long periods of time.
    - BCC 00-10033-600 (Precision Circuits Inc)
    - BIM160 00-10041-200 (Precision Circuits Inc)
        - [NW RV Supply](https://www.nwrvsupply.com/product/precision-circuits-inc-battery-isolation-manager-160amp-00-10041-200/)
        - Flooded / Flooded battery isolation
    - BIM225 00-10041-260 (Precision Circuits Inc)
        - [PCI LI BIM](https://www.precisioncircuitsinc.com/product/lithium-battery-isolation-manager/)
        -
### Battery Compartment
- 25"w 7"d 8"h: battery
- 25"w 7"d 9"h: box
- 1" lip around


### Intertainment
- 18AWG black/red wire
- panel switch
- dc / dc converter 12v to 5v

### Seating Power
- 20A 12V socket
- 10AWG black/red wire
- 20A fuse

### Connexx connections
- orange coax: RF/TV Antenna
- black coax: atenna
- speakers: blue-black/black, green-black/black
- heavy red/black: 12vdc

### BluRay 12v
- positive = inner
- negative = outer

### USB 5v
- positive = red (pin 1)
- negative = black (pin 4)
