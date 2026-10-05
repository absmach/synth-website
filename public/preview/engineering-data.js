/* Registry/source reference extracted from core f25fd8b. Not compiler output or a live supply quote. */
window.SYNTH_ENGINEERING_DATA = {
  "parts": [
    {
      "ref": "J1",
      "kind": "connector",
      "id": "usb_c_receptacle",
      "value": "",
      "description": "USB-C receptacle, 24-pin SMD. Modelled here with primary and mirrored power/ground/data pins for full pad coverage.",
      "symbol": "Connector:USB_C_Receptacle",
      "footprint": "Connector_USB:USB_C_Receptacle_HRO_TYPE-C-31-M-12",
      "pins": [
        {
          "name": "vbus",
          "number": "A4",
          "electrical_type": "power_input",
          "capabilities": [
            "usb_vbus"
          ]
        },
        {
          "name": "gnd",
          "number": "A1",
          "electrical_type": "power_input"
        },
        {
          "name": "dp",
          "number": "A6",
          "electrical_type": "differential_positive",
          "capabilities": [
            "usb_dp"
          ]
        },
        {
          "name": "dn",
          "number": "A7",
          "electrical_type": "differential_negative",
          "capabilities": [
            "usb_dn"
          ]
        },
        {
          "name": "cc1",
          "number": "A5",
          "electrical_type": "bidirectional",
          "capabilities": [
            "usb_cc"
          ]
        },
        {
          "name": "cc2",
          "number": "B5",
          "electrical_type": "bidirectional",
          "capabilities": [
            "usb_cc"
          ]
        },
        {
          "name": "gnd_b12",
          "number": "B12",
          "electrical_type": "power_input"
        },
        {
          "name": "gnd_a12",
          "number": "A12",
          "electrical_type": "power_input"
        },
        {
          "name": "gnd_b1",
          "number": "B1",
          "electrical_type": "power_input"
        },
        {
          "name": "vbus_b4",
          "number": "B4",
          "electrical_type": "power_input",
          "capabilities": [
            "usb_vbus"
          ]
        },
        {
          "name": "vbus_a9",
          "number": "A9",
          "electrical_type": "power_input",
          "capabilities": [
            "usb_vbus"
          ]
        },
        {
          "name": "vbus_b9",
          "number": "B9",
          "electrical_type": "power_input",
          "capabilities": [
            "usb_vbus"
          ]
        },
        {
          "name": "dp_b6",
          "number": "B6",
          "electrical_type": "differential_positive",
          "capabilities": [
            "usb_dp"
          ]
        },
        {
          "name": "dn_b7",
          "number": "B7",
          "electrical_type": "differential_negative",
          "capabilities": [
            "usb_dn"
          ]
        },
        {
          "name": "shld",
          "number": "SH",
          "electrical_type": "passive"
        },
        {
          "name": "sbu1",
          "number": "A8",
          "electrical_type": "passive"
        },
        {
          "name": "sbu2",
          "number": "B8",
          "electrical_type": "passive"
        }
      ],
      "path": "registry/parts/connectors/usb_c_receptacle.synth.toml"
    },
    {
      "ref": "R_CC1",
      "kind": "resistor",
      "id": "r_generic_0603",
      "value": "5.1k",
      "description": "Generic 0603 thick-film resistor, any value",
      "symbol": "Device:R_US",
      "footprint": "Resistor_SMD:R_0603_1608Metric",
      "pins": [
        {
          "name": "p1",
          "number": "1",
          "electrical_type": "passive"
        },
        {
          "name": "p2",
          "number": "2",
          "electrical_type": "passive"
        }
      ],
      "path": "registry/parts/passives/r_generic_0603.synth.toml"
    },
    {
      "ref": "R_CC2",
      "kind": "resistor",
      "id": "r_generic_0603",
      "value": "5.1k",
      "description": "Generic 0603 thick-film resistor, any value",
      "symbol": "Device:R_US",
      "footprint": "Resistor_SMD:R_0603_1608Metric",
      "pins": [
        {
          "name": "p1",
          "number": "1",
          "electrical_type": "passive"
        },
        {
          "name": "p2",
          "number": "2",
          "electrical_type": "passive"
        }
      ],
      "path": "registry/parts/passives/r_generic_0603.synth.toml"
    },
    {
      "ref": "U1",
      "kind": "regulator",
      "id": "ams1117_3v3",
      "value": "AMS1117-3.3",
      "description": "AMS1117-3.3 fixed 3.3V LDO regulator, SOT-223 \u2014 common JLC stock",
      "symbol": "Regulator_Linear:AMS1117-3.3",
      "footprint": "Package_TO_SOT_SMD:SOT-223-3_TabPin2",
      "pins": [
        {
          "name": "gnd",
          "number": "1",
          "electrical_type": "power_input",
          "required": true
        },
        {
          "name": "vout",
          "number": "2",
          "electrical_type": "power_output",
          "voltage_nominal_v": 3.3,
          "required": true
        },
        {
          "name": "vin",
          "number": "3",
          "electrical_type": "power_input",
          "required": true
        }
      ],
      "path": "registry/parts/regulators/ams1117_3v3.synth.toml"
    },
    {
      "ref": "C1",
      "kind": "capacitor",
      "id": "c_generic_0805",
      "value": "10uF",
      "description": "Generic 0805 MLCC, X7R/X5R, any value",
      "symbol": "Device:C",
      "footprint": "Capacitor_SMD:C_0805_2012Metric",
      "pins": [
        {
          "name": "p1",
          "number": "1",
          "electrical_type": "passive"
        },
        {
          "name": "p2",
          "number": "2",
          "electrical_type": "passive"
        }
      ],
      "path": "registry/parts/passives/c_generic_0805.synth.toml"
    },
    {
      "ref": "C2",
      "kind": "capacitor",
      "id": "c_generic_0805",
      "value": "22uF",
      "description": "Generic 0805 MLCC, X7R/X5R, any value",
      "symbol": "Device:C",
      "footprint": "Capacitor_SMD:C_0805_2012Metric",
      "pins": [
        {
          "name": "p1",
          "number": "1",
          "electrical_type": "passive"
        },
        {
          "name": "p2",
          "number": "2",
          "electrical_type": "passive"
        }
      ],
      "path": "registry/parts/passives/c_generic_0805.synth.toml"
    },
    {
      "ref": "C3",
      "kind": "capacitor",
      "id": "c_generic_0805",
      "value": "22uF",
      "description": "Generic 0805 MLCC, X7R/X5R, any value",
      "symbol": "Device:C",
      "footprint": "Capacitor_SMD:C_0805_2012Metric",
      "pins": [
        {
          "name": "p1",
          "number": "1",
          "electrical_type": "passive"
        },
        {
          "name": "p2",
          "number": "2",
          "electrical_type": "passive"
        }
      ],
      "path": "registry/parts/passives/c_generic_0805.synth.toml"
    },
    {
      "ref": "C7",
      "kind": "capacitor",
      "id": "c_generic_0603",
      "value": "100nF",
      "description": "Generic 0603 MLCC, X7R/X5R, any value",
      "symbol": "Device:C",
      "footprint": "Capacitor_SMD:C_0603_1608Metric",
      "pins": [
        {
          "name": "p1",
          "number": "1",
          "electrical_type": "passive"
        },
        {
          "name": "p2",
          "number": "2",
          "electrical_type": "passive"
        }
      ],
      "path": "registry/parts/passives/c_generic_0603.synth.toml"
    },
    {
      "ref": "U2",
      "kind": "mcu",
      "id": "stm32f103c8",
      "value": "",
      "description": "STM32F103C8T6 ARM Cortex-M3 @ 72MHz, 64KB flash, LQFP-48 \u2014 the bluepill MCU",
      "symbol": "MCU_ST_STM32F1:STM32F103C8Tx",
      "footprint": "Package_QFP:LQFP-48_7x7mm_P0.5mm",
      "pins": [
        {
          "name": "vbat",
          "number": "1",
          "electrical_type": "power_input",
          "required": true
        },
        {
          "name": "pa0",
          "number": "10",
          "electrical_type": "bidirectional",
          "capabilities": [
            "gpio",
            "uart_tx"
          ]
        },
        {
          "name": "pa1",
          "number": "11",
          "electrical_type": "bidirectional",
          "capabilities": [
            "gpio",
            "uart_rx"
          ]
        },
        {
          "name": "pa9",
          "number": "30",
          "electrical_type": "bidirectional",
          "capabilities": [
            "gpio",
            "uart_tx"
          ]
        },
        {
          "name": "pa10",
          "number": "31",
          "electrical_type": "bidirectional",
          "capabilities": [
            "gpio",
            "uart_rx"
          ]
        },
        {
          "name": "pb6",
          "number": "42",
          "electrical_type": "bidirectional",
          "capabilities": [
            "gpio",
            "i2c_scl"
          ]
        },
        {
          "name": "pb7",
          "number": "43",
          "electrical_type": "bidirectional",
          "capabilities": [
            "gpio",
            "i2c_sda"
          ]
        },
        {
          "name": "vss",
          "number": "47",
          "electrical_type": "power_input",
          "required": true
        },
        {
          "name": "vdd",
          "number": "48",
          "electrical_type": "power_input",
          "required": true
        },
        {
          "name": "nrst",
          "number": "7",
          "electrical_type": "input",
          "capabilities": [
            "reset"
          ],
          "required": true
        },
        {
          "name": "boot0",
          "number": "44",
          "electrical_type": "input",
          "required": true
        }
      ],
      "path": "registry/parts/mcus/stm32f103c8.synth.toml"
    },
    {
      "ref": "J2",
      "kind": "connector",
      "id": "header_1x4",
      "value": "",
      "description": "1x4 through-hole pin header, 2.54mm pitch",
      "symbol": "Connector_Generic:Conn_01x04",
      "footprint": "Connector_PinHeader_2.54mm:PinHeader_1x04_P2.54mm_Vertical",
      "pins": [
        {
          "name": "p1",
          "number": "1",
          "electrical_type": "passive"
        },
        {
          "name": "p2",
          "number": "2",
          "electrical_type": "passive"
        },
        {
          "name": "p3",
          "number": "3",
          "electrical_type": "passive"
        },
        {
          "name": "p4",
          "number": "4",
          "electrical_type": "passive"
        }
      ],
      "path": "registry/parts/connectors/header_1x4.synth.toml"
    },
    {
      "ref": "C4",
      "kind": "capacitor",
      "id": "c_generic_0603",
      "value": "100nF",
      "description": "Generic 0603 MLCC, X7R/X5R, any value",
      "symbol": "Device:C",
      "footprint": "Capacitor_SMD:C_0603_1608Metric",
      "pins": [
        {
          "name": "p1",
          "number": "1",
          "electrical_type": "passive"
        },
        {
          "name": "p2",
          "number": "2",
          "electrical_type": "passive"
        }
      ],
      "path": "registry/parts/passives/c_generic_0603.synth.toml"
    },
    {
      "ref": "C8",
      "kind": "capacitor",
      "id": "c_generic_0603",
      "value": "100nF",
      "description": "Generic 0603 MLCC, X7R/X5R, any value",
      "symbol": "Device:C",
      "footprint": "Capacitor_SMD:C_0603_1608Metric",
      "pins": [
        {
          "name": "p1",
          "number": "1",
          "electrical_type": "passive"
        },
        {
          "name": "p2",
          "number": "2",
          "electrical_type": "passive"
        }
      ],
      "path": "registry/parts/passives/c_generic_0603.synth.toml"
    },
    {
      "ref": "R1",
      "kind": "resistor",
      "id": "r_generic_0603",
      "value": "10k",
      "description": "Generic 0603 thick-film resistor, any value",
      "symbol": "Device:R_US",
      "footprint": "Resistor_SMD:R_0603_1608Metric",
      "pins": [
        {
          "name": "p1",
          "number": "1",
          "electrical_type": "passive"
        },
        {
          "name": "p2",
          "number": "2",
          "electrical_type": "passive"
        }
      ],
      "path": "registry/parts/passives/r_generic_0603.synth.toml"
    },
    {
      "ref": "R_BOOT0",
      "kind": "resistor",
      "id": "r_generic_0603",
      "value": "10k",
      "description": "Generic 0603 thick-film resistor, any value",
      "symbol": "Device:R_US",
      "footprint": "Resistor_SMD:R_0603_1608Metric",
      "pins": [
        {
          "name": "p1",
          "number": "1",
          "electrical_type": "passive"
        },
        {
          "name": "p2",
          "number": "2",
          "electrical_type": "passive"
        }
      ],
      "path": "registry/parts/passives/r_generic_0603.synth.toml"
    },
    {
      "ref": "SW1",
      "kind": "switch",
      "id": "spst_tactile",
      "value": "",
      "description": "Generic SPST tactile button",
      "symbol": "Switch:SW_Push",
      "footprint": "Button_Switch_SMD:SW_SPST_PTS645Sx43SMTR92",
      "pins": [
        {
          "name": "p1",
          "number": "1",
          "electrical_type": "passive"
        },
        {
          "name": "p2",
          "number": "2",
          "electrical_type": "passive"
        }
      ],
      "path": "registry/parts/switches/spst_tactile.synth.toml"
    },
    {
      "ref": "C5",
      "kind": "capacitor",
      "id": "c_generic_0603",
      "value": "100nF",
      "description": "Generic 0603 MLCC, X7R/X5R, any value",
      "symbol": "Device:C",
      "footprint": "Capacitor_SMD:C_0603_1608Metric",
      "pins": [
        {
          "name": "p1",
          "number": "1",
          "electrical_type": "passive"
        },
        {
          "name": "p2",
          "number": "2",
          "electrical_type": "passive"
        }
      ],
      "path": "registry/parts/passives/c_generic_0603.synth.toml"
    },
    {
      "ref": "U3",
      "kind": "sensor",
      "id": "bme680_env",
      "value": "",
      "description": "Bosch BME680 environmental sensor: T/RH/P/VOC, I\u00b2C",
      "symbol": "Sensor:BME680",
      "footprint": "Package_LGA:Bosch_LGA-8_2.5x2.5mm_P0.65mm_ClockwisePinNumbering",
      "pins": [
        {
          "name": "vdd",
          "number": "8",
          "electrical_type": "power_input",
          "required": true
        },
        {
          "name": "gnd",
          "number": "1",
          "electrical_type": "power_input",
          "required": true
        },
        {
          "name": "sda",
          "number": "3",
          "electrical_type": "bidirectional",
          "capabilities": [
            "i2c_sda"
          ],
          "required": true
        },
        {
          "name": "scl",
          "number": "4",
          "electrical_type": "bidirectional",
          "capabilities": [
            "i2c_scl"
          ],
          "required": true
        },
        {
          "name": "csb",
          "number": "2",
          "electrical_type": "input",
          "required": true
        },
        {
          "name": "sdo",
          "number": "5",
          "electrical_type": "input",
          "required": true
        }
      ],
      "path": "registry/parts/sensors/bme680_env.synth.toml"
    },
    {
      "ref": "C6",
      "kind": "capacitor",
      "id": "c_generic_0603",
      "value": "100nF",
      "description": "Generic 0603 MLCC, X7R/X5R, any value",
      "symbol": "Device:C",
      "footprint": "Capacitor_SMD:C_0603_1608Metric",
      "pins": [
        {
          "name": "p1",
          "number": "1",
          "electrical_type": "passive"
        },
        {
          "name": "p2",
          "number": "2",
          "electrical_type": "passive"
        }
      ],
      "path": "registry/parts/passives/c_generic_0603.synth.toml"
    },
    {
      "ref": "R2",
      "kind": "resistor",
      "id": "r_generic_0603",
      "value": "4.7k",
      "description": "Generic 0603 thick-film resistor, any value",
      "symbol": "Device:R_US",
      "footprint": "Resistor_SMD:R_0603_1608Metric",
      "pins": [
        {
          "name": "p1",
          "number": "1",
          "electrical_type": "passive"
        },
        {
          "name": "p2",
          "number": "2",
          "electrical_type": "passive"
        }
      ],
      "path": "registry/parts/passives/r_generic_0603.synth.toml"
    },
    {
      "ref": "R3",
      "kind": "resistor",
      "id": "r_generic_0603",
      "value": "4.7k",
      "description": "Generic 0603 thick-film resistor, any value",
      "symbol": "Device:R_US",
      "footprint": "Resistor_SMD:R_0603_1608Metric",
      "pins": [
        {
          "name": "p1",
          "number": "1",
          "electrical_type": "passive"
        },
        {
          "name": "p2",
          "number": "2",
          "electrical_type": "passive"
        }
      ],
      "path": "registry/parts/passives/r_generic_0603.synth.toml"
    }
  ],
  "core_revision": "f25fd8b",
  "source_path": "examples/env_logger.synth",
  "nets": [
    {
      "name": "VBUS",
      "pins": [
        "C1.p1",
        "J1.vbus",
        "U1.vin",
        "C2.p1"
      ]
    },
    {
      "name": "GND",
      "pins": [
        "C1.p2",
        "J1.gnd",
        "R_CC1.p2",
        "R_CC2.p2",
        "U1.gnd",
        "C2.p2",
        "C3.p2",
        "C7.p2",
        "U2.vss",
        "C4.p2",
        "C8.p2",
        "R_BOOT0.p2",
        "SW1.p2",
        "C5.p2",
        "J2.p4",
        "U3.gnd",
        "U3.sdo",
        "C6.p2"
      ]
    },
    {
      "name": "R_CC1.p1",
      "pins": [
        "R_CC1.p1",
        "J1.cc1"
      ]
    },
    {
      "name": "R_CC2.p1",
      "pins": [
        "R_CC2.p1",
        "J1.cc2"
      ]
    },
    {
      "name": "3V3",
      "pins": [
        "C3.p1",
        "U1.vout",
        "C7.p1",
        "U2.vdd",
        "U2.vbat",
        "C4.p1",
        "C8.p1",
        "R1.p1",
        "J2.p1",
        "U3.vdd",
        "U3.csb",
        "C6.p1",
        "R2.p2",
        "R3.p2"
      ]
    },
    {
      "name": "U2.nrst",
      "pins": [
        "U2.nrst",
        "R1.p2",
        "SW1.p1",
        "C5.p1"
      ]
    },
    {
      "name": "R_BOOT0.p1",
      "pins": [
        "R_BOOT0.p1",
        "U2.boot0"
      ]
    },
    {
      "name": "J2.p2",
      "pins": [
        "J2.p2",
        "U2.pa9"
      ]
    },
    {
      "name": "J2.p3",
      "pins": [
        "J2.p3",
        "U2.pa10"
      ]
    },
    {
      "name": "I\u00b2C SDA",
      "pins": [
        "U3.sda",
        "U2.pb7",
        "R2.p1"
      ]
    },
    {
      "name": "I\u00b2C SCL",
      "pins": [
        "U3.scl",
        "U2.pb6",
        "R3.p1"
      ]
    }
  ]
};
