import {useContext, useEffect, useState} from "react";
import mqtt from "mqtt";
import {AuthContext} from "../contexts/AuthContext";

const useMQTT = (brokerUrl) => {
    const [messages, setMessages] = useState([]);
    const [client, setClient] = useState(null);

    const {user} = useContext(AuthContext);

    useEffect(() => {
        if (user && !client) {

            const topic = `notification/${user.topic}`;
            const options = {
                host: process.env.MQTTHost, // e.g., "mqtt://broker.hivemq.com"
                port: 8083, // default MQTT port
                username: "mqtt_admin", // your username
                password: "Y8pR5BFFGMzzM7xaD5qcpHkYnYXCM9X2", // your password
                clientId: `client_${user.topic}_${Math.random().toString(16).substr(2, 8)}`, // unique client id
                protocol: 'wss',
                keepalive: 60,
                reconnectPeriod: 1000,
            };
            // Connect to MQTT broker
            const mqttClient = mqtt.connect(options);

            mqttClient.on("connect", () => {
                console.log("Connected to MQTT Broker");

            });

            mqttClient.on("message", (topic, message) => {
                console.log("Received message on topic:", topic, message.toString());
                $("#notification_bullet").removeClass('invisible');
                console.log(messages);
                setMessages((prevMessages) => [JSON.parse(message), ...prevMessages]);
            });

            mqttClient.on("error", (err) => {
                console.error("MQTT Client Error:", err);
            });
            mqttClient.on("close", () => {
                console.log("MQTT client closed the connection");
            });
            mqttClient.on("disconnect", (packet) => {
                console.log("MQTT client disconnected:", packet);
            });

            mqttClient.subscribe(topic, (err, granted) => {
                if (err) {
                    console.error("Failed to subscribe:", err);
                } else {
                    console.log("Subscribed to topic:", granted);
                }
            });

            setClient(mqttClient);

            // Cleanup on component unmount
            return () => {
                //mqttClient.end();
            };
        }

    }, [user, client]);

    return {messages, client};
};

export default useMQTT;
