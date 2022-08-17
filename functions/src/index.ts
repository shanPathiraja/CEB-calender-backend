import * as functions from "firebase-functions";
import axios from "axios";
import {google} from "googleapis";
const oAuth2 = google.auth.OAuth2;
const calendar = google.calendar("v3");
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = String(0);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const googleCredentials = require("./credentials.json");

// eslint-disable-next-line require-jsdoc
function addEvent(event:any, auth:any) {
  const ev = {
    "summary": "Google I/O 2015",
    "location": "800 Howard St., San Francisco, CA 94103",
    "description": "A chance to hear more about Google's developer products.",
    "start": {
      "dateTime": "2022-08-28T09:00:00-07:00",
      "timeZone": "Asia/Colombo",
    },
    "end": {
      "dateTime": "2022-08-28T17:00:00-07:00",
      "timeZone": "Asia/Colombo",
    },
    "recurrence": [
      "RRULE:FREQ=DAILY;COUNT=2",
    ],
    "attendees": [
      {"email": "lpage@example.com"},
      {"email": "sbrin@example.com"},
    ],
    "reminders": {
      "useDefault": false,
      "overrides": [
        {"method": "email", "minutes": 24 * 60},
        {"method": "popup", "minutes": 10},
      ],
    },
  };
  // eslint-disable-next-line max-len
  calendar.events.insert({auth, calendarId: "primary", requestBody: ev}, (err:any, res:any) => {
    if (err) {
      console.log("Error creating event: " + err);
    } else {
      console.log("Event created: " + res.htmlLink);
    }
  }
  );
}
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

const getData = async ()=>{
  const data = "StartTime=2022-08-16&EndTime=2022-08-17";

  const config = {
    method: "post",
    url: "https://cebcare.ceb.lk/Incognito/GetLoadSheddingEvents",
    headers: {
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "Connection": "keep-alive",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      // eslint-disable-next-line max-len
      "Cookie": ".AspNetCore.Antiforgery.ThOcTlhnrMo=CfDJ8Ed8YgQVYi9HklDnDGoiq--1gsoJRp8PHWwLQNELktu6F5LrhhREBKVmoXtHDq5ATXm45CFgwIfZw7xHc-HemgCTk6hISGcCiELzLQ_AXyGqoyOy-NDeA_jYN0dpzofAoy2U_u5QLSf4LTV6aUsClBX",
      "Referer": "https://cebcare.ceb.lk/Incognito/DemandMgmtSchedule",
      // eslint-disable-next-line max-len
      "RequestVerificationToken": "CfDJ8Ed8YgQVYi9HklDnDGoiq-_mZdZ7SSY_gjfCkeqAjzyiR-CMwtX4eT-Q_eipGTqhuS_YHAr85Kex5q6B5ZiPBUXz553yBTb0t56Z1o9SmROzdKxfuInxY-qBtk4mn1zKkpfHzeEQjRW5woa3Uq9J3uQ",
      "Sec-Fetch-Mode": "cors",
    },
    data: data,
  };
  return await axios(config).then((res) => {
    return res.data;
  }).catch((err) => {
    return err;
  });
};

// eslint-disable-next-line max-len
export const addEventToCalendar = functions.https.onRequest(async (req, res) => {
  // eslint-disable-next-line new-cap
  const oAuthClient = new oAuth2(
      googleCredentials.web.client_id,
      googleCredentials.web.client_secret,
      googleCredentials.web.redirect_uris[0],
  );
  oAuthClient.setCredentials({
    refresh_token: googleCredentials.refresh_token,
  });
  const data = await getData();
  console.log(data);
  addEvent(data, oAuthClient);
  res.send("Event added to calendar");
});

// function getAccessToken(oAuthClient: OAuth2Client, callback:any){
//   const authURL =
// }

// eslint-disable-next-line max-len
export const getCEBDATA = functions.https.onRequest(async (request, response) => {
  const data = await getData();
  const modifiedData = data.map((item:any) => {
    return {
      id: item.id,
      startTime: item.startTime,
      endTime: item.endTime,
      loadShedGroupId: item.loadShedGroupId,
    };
  });
  response.send(modifiedData);
});
