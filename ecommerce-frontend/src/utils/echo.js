import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Attach Pusher to the window (optional but common)
window.Pusher = Pusher;

const token = localStorage.getItem("token");

window.Echo = new Echo({
  broadcaster: "pusher",
  key: "33d15f532359398930a7", // your PUSHER_APP_KEY
  cluster: "mt1", // your PUSHER_APP_CLUSTER
  forceTLS: true,
  encrypted: true,
  authEndpoint: "https://www.thriftify.website:8000/broadcasting/auth",
  auth: {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  },
});
