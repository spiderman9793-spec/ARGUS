import glob
import logging
import os
import time

logger = logging.getLogger("argus.serial")

class SerialBridge:
    def __init__(self, port: str = None, baud: int = 9600):
        self.port = port or os.getenv("ARDUINO_PORT")
        self.baud = int(os.getenv("ARDUINO_BAUD", baud))
        self.serial_conn = None
        self._find_and_connect()

    def _find_and_connect(self):
        try:
            import serial
        except ImportError:
            logger.warning("pyserial is not installed. Arduino bridge will operate in dummy mode.")
            return

        candidate_ports = []
        if self.port:
            candidate_ports.append(self.port)
        else:
            candidate_ports.extend(glob.glob("/dev/cu.usbmodem*"))
            candidate_ports.extend(glob.glob("/dev/cu.usbserial*"))

        for p in candidate_ports:
            try:
                self.serial_conn = serial.Serial(p, self.baud, timeout=1)
                self.port = p
                logger.info(f"Arduino connected on port {p}")
                return
            except Exception as e:
                logger.debug(f"Could not open port {p}: {e}")

        logger.info("No Arduino connected. Serial bridge in standby mode.")

    def send_command(self, cmd: str) -> bool:
        """Sends a newline-terminated command string to the Arduino."""
        if not self.serial_conn or not self.serial_conn.is_open:
            # Attempt reconnect
            self._find_and_connect()

        if self.serial_conn and self.serial_conn.is_open:
            try:
                self.serial_conn.write(f"{cmd}\n".encode("utf-8"))
                self.serial_conn.flush()
                logger.info(f"Command sent to Arduino: {cmd}")
                return True
            except Exception as e:
                logger.error(f"Error writing to Arduino: {e}")
                self.serial_conn = None
                return False
        return False

    def trigger_match_alert(self):
        """Called upon hotlist match to activate gate/siren"""
        return self.send_command("SIREN_ON")

arduino_bridge = SerialBridge()

