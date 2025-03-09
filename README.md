We have 12 colors (0 - 12 = 13 variants) - to store color we need 4 bits (0 - 16)
To store 4 colors we need 16 bit -> 2 byte
To Store container number (0 - 13) we need 4 bits (0 - 16)
To store container we need 4 colors and container number - > 2 byte + 4 bit = 20 bit
To store 14 containers we need 20 bit * 14 = 280 bits = 35 bytes.

To get unique code of game:
1. Sort containers by color.
2. Concatenate bits of colors for each containers (without container number).
3. Transform to HEX.

-----------------------------------------------------------------


check ports:

netstat -a -n -o
  find 4200, copy PID
  execute 
taskkill -f /pid 19016


-----------------------------------------------------------------
1. In Main menu add item load game
2. In Play view add menu item save game
3. Save game view
4. Load game view.
