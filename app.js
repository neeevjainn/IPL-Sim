/* ================================================================
   IPL MUN — APPLICATION  (app.js)
   Data · State · UI Render · Actions · Boot
   ================================================================ */
'use strict';

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const APP   = { version: '5.0', key: 'iplmun_v5' };

var BUNDLED_PLAYERS = [{"csvSet":1,"name":"Suryakumar Yadav","role":"BAT","basePrice":2.0,"ratings":{"bat":97,"bowl":10,"field":85,"keep":0},"form":90,"injuryProne":30,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":1,"name":"Virat Kohli","role":"BAT","basePrice":2.0,"ratings":{"bat":94,"bowl":12,"field":88,"keep":0},"form":82,"injuryProne":28,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":1,"name":"Rohit Sharma","role":"BAT","basePrice":2.0,"ratings":{"bat":88,"bowl":10,"field":80,"keep":0},"form":72,"injuryProne":35,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":1,"name":"Shubman Gill","role":"BAT","basePrice":2.0,"ratings":{"bat":88,"bowl":15,"field":84,"keep":0},"form":86,"injuryProne":25,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":1,"name":"Yashasvi Jaiswal","role":"BAT","basePrice":2.0,"ratings":{"bat":91,"bowl":10,"field":85,"keep":0},"form":90,"injuryProne":18,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":1,"name":"Travis Head","role":"BAT","basePrice":2.0,"ratings":{"bat":90,"bowl":20,"field":82,"keep":0},"form":88,"injuryProne":20,"tier":"star","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":1,"name":"Shreyas Iyer","role":"BAT","basePrice":2.0,"ratings":{"bat":84,"bowl":10,"field":80,"keep":0},"form":78,"injuryProne":58,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":1,"name":"Aiden Markram","role":"ALL","basePrice":2.0,"ratings":{"bat":82,"bowl":54,"field":83,"keep":0},"form":80,"injuryProne":22,"tier":"star","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":1,"name":"Abhishek Sharma","role":"ALL","basePrice":2.0,"ratings":{"bat":80,"bowl":56,"field":80,"keep":0},"form":88,"injuryProne":20,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":1,"name":"Ruturaj Gaikwad","role":"BAT","basePrice":2.0,"ratings":{"bat":85,"bowl":12,"field":82,"keep":0},"form":84,"injuryProne":22,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":1,"name":"Mitchell Marsh","role":"ALL","basePrice":2.0,"ratings":{"bat":82,"bowl":72,"field":80,"keep":0},"form":82,"injuryProne":50,"tier":"star","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":1,"name":"David Miller","role":"BAT","basePrice":2.0,"ratings":{"bat":84,"bowl":10,"field":80,"keep":0},"form":78,"injuryProne":22,"tier":"star","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":1,"name":"Ajinkya Rahane","role":"BAT","basePrice":2.0,"ratings":{"bat":72,"bowl":10,"field":80,"keep":0},"form":65,"injuryProne":28,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":1,"name":"Daryl Mitchell","role":"ALL","basePrice":2.0,"ratings":{"bat":79,"bowl":40,"field":78,"keep":0},"form":76,"injuryProne":20,"tier":"star","country":"NZ","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":1,"name":"Steve Smith","role":"BAT","basePrice":2.0,"ratings":{"bat":74,"bowl":22,"field":80,"keep":0},"form":68,"injuryProne":20,"tier":"star","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":2,"name":"Hardik Pandya","role":"ALL","basePrice":2.0,"ratings":{"bat":84,"bowl":82,"field":84,"keep":0},"form":75,"injuryProne":62,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":2,"name":"Ravindra Jadeja","role":"ALL","basePrice":2.0,"ratings":{"bat":76,"bowl":86,"field":95,"keep":0},"form":80,"injuryProne":38,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":2,"name":"Glenn Maxwell","role":"ALL","basePrice":2.0,"ratings":{"bat":86,"bowl":72,"field":82,"keep":0},"form":76,"injuryProne":45,"tier":"star","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":2,"name":"Sam Curran","role":"ALL","basePrice":2.0,"ratings":{"bat":70,"bowl":82,"field":78,"keep":0},"form":78,"injuryProne":40,"tier":"star","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":2,"name":"Marcus Stoinis","role":"ALL","basePrice":2.0,"ratings":{"bat":76,"bowl":72,"field":78,"keep":0},"form":74,"injuryProne":38,"tier":"star","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":2,"name":"Axar Patel","role":"ALL","basePrice":2.0,"ratings":{"bat":72,"bowl":84,"field":82,"keep":0},"form":82,"injuryProne":28,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":2,"name":"Sunil Narine","role":"ALL","basePrice":2.0,"ratings":{"bat":80,"bowl":84,"field":78,"keep":0},"form":82,"injuryProne":22,"tier":"star","country":"WI","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":2,"name":"Rashid Khan","role":"ALL","basePrice":2.0,"ratings":{"bat":62,"bowl":96,"field":82,"keep":0},"form":88,"injuryProne":18,"tier":"star","country":"AFG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":2,"name":"Cameron Green","role":"ALL","basePrice":2.0,"ratings":{"bat":78,"bowl":74,"field":80,"keep":0},"form":72,"injuryProne":60,"tier":"star","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":2,"name":"Shivam Dube","role":"ALL","basePrice":2.0,"ratings":{"bat":74,"bowl":62,"field":76,"keep":0},"form":82,"injuryProne":30,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":2,"name":"Jason Holder","role":"ALL","basePrice":2.0,"ratings":{"bat":66,"bowl":80,"field":80,"keep":0},"form":74,"injuryProne":22,"tier":"star","country":"WI","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":2,"name":"Rachin Ravindra","role":"ALL","basePrice":2.0,"ratings":{"bat":80,"bowl":68,"field":82,"keep":0},"form":82,"injuryProne":18,"tier":"star","country":"NZ","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":2,"name":"Mitchell Santner","role":"ALL","basePrice":2.0,"ratings":{"bat":65,"bowl":80,"field":78,"keep":0},"form":76,"injuryProne":22,"tier":"star","country":"NZ","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":2,"name":"Shardul Thakur","role":"ALL","basePrice":2.0,"ratings":{"bat":66,"bowl":76,"field":78,"keep":0},"form":70,"injuryProne":38,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":2,"name":"Marco Jansen","role":"ALL","basePrice":2.0,"ratings":{"bat":64,"bowl":80,"field":76,"keep":0},"form":74,"injuryProne":25,"tier":"star","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":2,"name":"Venkatesh Iyer","role":"ALL","basePrice":2.0,"ratings":{"bat":76,"bowl":62,"field":76,"keep":0},"form":76,"injuryProne":25,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":2,"name":"Nitish Kumar Reddy","role":"ALL","basePrice":2.0,"ratings":{"bat":76,"bowl":68,"field":76,"keep":0},"form":82,"injuryProne":18,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":2,"name":"Liam Livingstone","role":"ALL","basePrice":2.0,"ratings":{"bat":84,"bowl":70,"field":78,"keep":0},"form":74,"injuryProne":35,"tier":"star","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":3,"name":"Jos Buttler","role":"WK","basePrice":2.0,"ratings":{"bat":94,"bowl":0,"field":85,"keep":90},"form":84,"injuryProne":28,"tier":"star","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":3,"name":"KL Rahul","role":"WK","basePrice":2.0,"ratings":{"bat":88,"bowl":0,"field":82,"keep":86},"form":78,"injuryProne":55,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":3,"name":"Rishabh Pant","role":"WK","basePrice":2.0,"ratings":{"bat":90,"bowl":0,"field":80,"keep":82},"form":84,"injuryProne":48,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":3,"name":"Quinton de Kock","role":"WK","basePrice":2.0,"ratings":{"bat":88,"bowl":0,"field":84,"keep":88},"form":82,"injuryProne":22,"tier":"star","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":3,"name":"Heinrich Klaasen","role":"WK","basePrice":2.0,"ratings":{"bat":90,"bowl":0,"field":82,"keep":86},"form":86,"injuryProne":20,"tier":"star","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":3,"name":"Nicholas Pooran","role":"WK","basePrice":2.0,"ratings":{"bat":86,"bowl":0,"field":80,"keep":84},"form":82,"injuryProne":22,"tier":"star","country":"WI","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":3,"name":"Phil Salt","role":"WK","basePrice":2.0,"ratings":{"bat":86,"bowl":0,"field":82,"keep":82},"form":84,"injuryProne":20,"tier":"star","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":3,"name":"Josh Inglis","role":"WK","basePrice":2.0,"ratings":{"bat":79,"bowl":0,"field":80,"keep":82},"form":76,"injuryProne":22,"tier":"star","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":3,"name":"Jonny Bairstow","role":"WK","basePrice":2.0,"ratings":{"bat":82,"bowl":0,"field":80,"keep":84},"form":74,"injuryProne":60,"tier":"star","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":3,"name":"Sanju Samson","role":"WK","basePrice":2.0,"ratings":{"bat":87,"bowl":0,"field":82,"keep":84},"form":82,"injuryProne":28,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":3,"name":"Ishan Kishan","role":"WK","basePrice":2.0,"ratings":{"bat":82,"bowl":0,"field":80,"keep":82},"form":68,"injuryProne":30,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":3,"name":"Rahmanullah Gurbaz","role":"WK","basePrice":2.0,"ratings":{"bat":82,"bowl":0,"field":78,"keep":80},"form":82,"injuryProne":20,"tier":"star","country":"AFG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":3,"name":"Devon Conway","role":"WK","basePrice":2.0,"ratings":{"bat":82,"bowl":0,"field":82,"keep":82},"form":78,"injuryProne":28,"tier":"star","country":"NZ","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":3,"name":"Tristan Stubbs","role":"WK","basePrice":2.0,"ratings":{"bat":78,"bowl":0,"field":80,"keep":78},"form":76,"injuryProne":20,"tier":"star","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":3,"name":"Glenn Phillips","role":"WK","basePrice":2.0,"ratings":{"bat":82,"bowl":45,"field":82,"keep":80},"form":78,"injuryProne":20,"tier":"star","country":"NZ","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":3,"name":"Ryan Rickelton","role":"WK","basePrice":2.0,"ratings":{"bat":78,"bowl":0,"field":78,"keep":78},"form":76,"injuryProne":18,"tier":"star","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":3,"name":"Dhruv Jurel","role":"WK","basePrice":2.0,"ratings":{"bat":74,"bowl":0,"field":78,"keep":80},"form":75,"injuryProne":18,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":4,"name":"Jasprit Bumrah","role":"PACE","basePrice":2.0,"ratings":{"bat":18,"bowl":98,"field":70,"keep":0},"form":88,"injuryProne":62,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":4,"name":"T. Natarajan","role":"PACE","basePrice":2.0,"ratings":{"bat":15,"bowl":80,"field":68,"keep":0},"form":76,"injuryProne":55,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":4,"name":"Mitchell Starc","role":"PACE","basePrice":2.0,"ratings":{"bat":25,"bowl":90,"field":72,"keep":0},"form":84,"injuryProne":42,"tier":"star","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":4,"name":"Pat Cummins","role":"PACE","basePrice":2.0,"ratings":{"bat":32,"bowl":88,"field":74,"keep":0},"form":84,"injuryProne":45,"tier":"star","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":4,"name":"Kagiso Rabada","role":"PACE","basePrice":2.0,"ratings":{"bat":28,"bowl":92,"field":74,"keep":0},"form":86,"injuryProne":45,"tier":"star","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":4,"name":"Jofra Archer","role":"PACE","basePrice":2.0,"ratings":{"bat":22,"bowl":89,"field":72,"keep":0},"form":76,"injuryProne":82,"tier":"star","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":4,"name":"Trent Boult","role":"PACE","basePrice":2.0,"ratings":{"bat":22,"bowl":87,"field":70,"keep":0},"form":80,"injuryProne":38,"tier":"star","country":"NZ","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":4,"name":"Josh Hazlewood","role":"PACE","basePrice":2.0,"ratings":{"bat":20,"bowl":87,"field":70,"keep":0},"form":82,"injuryProne":40,"tier":"star","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":4,"name":"Lockie Ferguson","role":"PACE","basePrice":2.0,"ratings":{"bat":18,"bowl":83,"field":68,"keep":0},"form":78,"injuryProne":45,"tier":"star","country":"NZ","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":4,"name":"Mohammed Shami","role":"PACE","basePrice":2.0,"ratings":{"bat":18,"bowl":88,"field":68,"keep":0},"form":80,"injuryProne":48,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":4,"name":"Mohammed Siraj","role":"PACE","basePrice":2.0,"ratings":{"bat":15,"bowl":82,"field":68,"keep":0},"form":78,"injuryProne":32,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":4,"name":"Arshdeep Singh","role":"PACE","basePrice":2.0,"ratings":{"bat":18,"bowl":84,"field":70,"keep":0},"form":82,"injuryProne":28,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":4,"name":"Bhuvneshwar Kumar","role":"PACE","basePrice":2.0,"ratings":{"bat":22,"bowl":80,"field":68,"keep":0},"form":72,"injuryProne":50,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":4,"name":"Anrich Nortje","role":"PACE","basePrice":2.0,"ratings":{"bat":18,"bowl":86,"field":68,"keep":0},"form":74,"injuryProne":55,"tier":"star","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":4,"name":"Lungi Ngidi","role":"PACE","basePrice":2.0,"ratings":{"bat":18,"bowl":80,"field":68,"keep":0},"form":76,"injuryProne":42,"tier":"star","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":4,"name":"Prasidh Krishna","role":"PACE","basePrice":2.0,"ratings":{"bat":18,"bowl":79,"field":68,"keep":0},"form":76,"injuryProne":38,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":4,"name":"Harshit Rana","role":"PACE","basePrice":2.0,"ratings":{"bat":18,"bowl":76,"field":68,"keep":0},"form":78,"injuryProne":22,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":4,"name":"Deepak Chahar","role":"PACE","basePrice":2.0,"ratings":{"bat":32,"bowl":78,"field":70,"keep":0},"form":72,"injuryProne":55,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":5,"name":"Yuzvendra Chahal","role":"SPIN","basePrice":2.0,"ratings":{"bat":12,"bowl":88,"field":62,"keep":0},"form":80,"injuryProne":22,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":5,"name":"Kuldeep Yadav","role":"SPIN","basePrice":2.0,"ratings":{"bat":14,"bowl":88,"field":62,"keep":0},"form":84,"injuryProne":32,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":5,"name":"Adam Zampa","role":"SPIN","basePrice":2.0,"ratings":{"bat":14,"bowl":85,"field":64,"keep":0},"form":82,"injuryProne":20,"tier":"star","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":5,"name":"Wanindu Hasaranga","role":"ALL","basePrice":2.0,"ratings":{"bat":48,"bowl":87,"field":72,"keep":0},"form":82,"injuryProne":25,"tier":"star","country":"SL","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":5,"name":"Noor Ahmad","role":"SPIN","basePrice":2.0,"ratings":{"bat":12,"bowl":84,"field":62,"keep":0},"form":84,"injuryProne":18,"tier":"star","country":"AFG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":5,"name":"Ravi Bishnoi","role":"SPIN","basePrice":2.0,"ratings":{"bat":14,"bowl":84,"field":64,"keep":0},"form":80,"injuryProne":22,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":5,"name":"Varun Chakravarthy","role":"SPIN","basePrice":2.0,"ratings":{"bat":12,"bowl":86,"field":60,"keep":0},"form":82,"injuryProne":35,"tier":"star","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":5,"name":"Akeal Hosein","role":"SPIN","basePrice":2.0,"ratings":{"bat":22,"bowl":76,"field":64,"keep":0},"form":74,"injuryProne":22,"tier":"star","country":"WI","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":5,"name":"Keshav Maharaj","role":"SPIN","basePrice":2.0,"ratings":{"bat":25,"bowl":78,"field":62,"keep":0},"form":76,"injuryProne":20,"tier":"star","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":5,"name":"Adil Rashid","role":"SPIN","basePrice":2.0,"ratings":{"bat":28,"bowl":83,"field":64,"keep":0},"form":78,"injuryProne":30,"tier":"star","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":5,"name":"Maheesh Theekshana","role":"SPIN","basePrice":2.0,"ratings":{"bat":14,"bowl":82,"field":62,"keep":0},"form":80,"injuryProne":22,"tier":"star","country":"SL","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":6,"name":"Tilak Varma","role":"BAT","basePrice":1.5,"ratings":{"bat":82,"bowl":25,"field":82,"keep":0},"form":84,"injuryProne":18,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":6,"name":"Dewald Brevis","role":"BAT","basePrice":1.5,"ratings":{"bat":78,"bowl":12,"field":78,"keep":0},"form":76,"injuryProne":22,"tier":"good","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":6,"name":"Ben Duckett","role":"BAT","basePrice":1.5,"ratings":{"bat":80,"bowl":22,"field":80,"keep":0},"form":80,"injuryProne":22,"tier":"good","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":6,"name":"Sai Sudarshan","role":"BAT","basePrice":1.5,"ratings":{"bat":76,"bowl":28,"field":80,"keep":0},"form":78,"injuryProne":18,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":6,"name":"Finn Allen","role":"BAT","basePrice":1.5,"ratings":{"bat":78,"bowl":12,"field":78,"keep":0},"form":76,"injuryProne":22,"tier":"good","country":"NZ","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":6,"name":"Karun Nair","role":"BAT","basePrice":1.5,"ratings":{"bat":72,"bowl":12,"field":76,"keep":0},"form":70,"injuryProne":25,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":6,"name":"Evin Lewis","role":"BAT","basePrice":1.5,"ratings":{"bat":78,"bowl":12,"field":74,"keep":0},"form":72,"injuryProne":28,"tier":"good","country":"WI","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":6,"name":"Prithvi Shaw","role":"BAT","basePrice":1.5,"ratings":{"bat":76,"bowl":12,"field":76,"keep":0},"form":68,"injuryProne":35,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":6,"name":"Jake Fraser-McGurk","role":"BAT","basePrice":1.5,"ratings":{"bat":80,"bowl":12,"field":78,"keep":0},"form":82,"injuryProne":18,"tier":"good","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":6,"name":"Rinku Singh","role":"BAT","basePrice":1.5,"ratings":{"bat":78,"bowl":12,"field":76,"keep":0},"form":80,"injuryProne":22,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":6,"name":"Rajat Patidar","role":"BAT","basePrice":1.5,"ratings":{"bat":74,"bowl":12,"field":76,"keep":0},"form":76,"injuryProne":22,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":6,"name":"Nitish Rana","role":"ALL","basePrice":1.5,"ratings":{"bat":72,"bowl":32,"field":74,"keep":0},"form":68,"injuryProne":28,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":6,"name":"Pathum Nishanka","role":"BAT","basePrice":1.5,"ratings":{"bat":74,"bowl":12,"field":76,"keep":0},"form":74,"injuryProne":22,"tier":"good","country":"SL","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":6,"name":"Devdutt Padikkal","role":"BAT","basePrice":1.5,"ratings":{"bat":74,"bowl":12,"field":78,"keep":0},"form":72,"injuryProne":22,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":6,"name":"Manish Pandey","role":"BAT","basePrice":1.5,"ratings":{"bat":72,"bowl":12,"field":78,"keep":0},"form":64,"injuryProne":30,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":6,"name":"Shashank Singh","role":"BAT","basePrice":1.5,"ratings":{"bat":74,"bowl":12,"field":76,"keep":0},"form":76,"injuryProne":22,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":6,"name":"Shimron Hetmyer","role":"BAT","basePrice":1.5,"ratings":{"bat":78,"bowl":12,"field":72,"keep":0},"form":72,"injuryProne":32,"tier":"good","country":"WI","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":7,"name":"Azmatullah Omarzai","role":"ALL","basePrice":1.5,"ratings":{"bat":68,"bowl":72,"field":74,"keep":0},"form":76,"injuryProne":20,"tier":"good","country":"AFG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":7,"name":"Riyan Parag","role":"ALL","basePrice":1.5,"ratings":{"bat":74,"bowl":62,"field":80,"keep":0},"form":78,"injuryProne":18,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":7,"name":"Romario Shepherd","role":"ALL","basePrice":1.5,"ratings":{"bat":66,"bowl":74,"field":72,"keep":0},"form":72,"injuryProne":25,"tier":"good","country":"WI","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":7,"name":"Jimmy Neesham","role":"ALL","basePrice":1.5,"ratings":{"bat":68,"bowl":72,"field":74,"keep":0},"form":70,"injuryProne":28,"tier":"good","country":"NZ","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":7,"name":"Cooper Connolly","role":"ALL","basePrice":1.5,"ratings":{"bat":68,"bowl":68,"field":76,"keep":0},"form":72,"injuryProne":18,"tier":"good","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":7,"name":"Michael Bracewell","role":"ALL","basePrice":1.5,"ratings":{"bat":68,"bowl":70,"field":74,"keep":0},"form":70,"injuryProne":22,"tier":"good","country":"NZ","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":7,"name":"Kyle Mayers","role":"ALL","basePrice":1.5,"ratings":{"bat":70,"bowl":70,"field":74,"keep":0},"form":72,"injuryProne":22,"tier":"good","country":"WI","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":7,"name":"Mohammad Nabi","role":"ALL","basePrice":1.5,"ratings":{"bat":64,"bowl":72,"field":72,"keep":0},"form":68,"injuryProne":22,"tier":"good","country":"AFG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":7,"name":"Jamie Overton","role":"ALL","basePrice":1.5,"ratings":{"bat":64,"bowl":72,"field":72,"keep":0},"form":70,"injuryProne":30,"tier":"good","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":7,"name":"Matthew Short","role":"ALL","basePrice":1.5,"ratings":{"bat":70,"bowl":68,"field":76,"keep":0},"form":72,"injuryProne":18,"tier":"good","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":7,"name":"Sikandar Raza","role":"ALL","basePrice":1.5,"ratings":{"bat":68,"bowl":70,"field":72,"keep":0},"form":68,"injuryProne":25,"tier":"good","country":"ZIM","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":7,"name":"Ramandeep Singh","role":"ALL","basePrice":1.5,"ratings":{"bat":68,"bowl":64,"field":76,"keep":0},"form":72,"injuryProne":22,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":7,"name":"Aayush Badoni","role":"ALL","basePrice":1.5,"ratings":{"bat":66,"bowl":62,"field":76,"keep":0},"form":70,"injuryProne":18,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":7,"name":"Corbin Bosch","role":"ALL","basePrice":1.5,"ratings":{"bat":64,"bowl":72,"field":72,"keep":0},"form":70,"injuryProne":22,"tier":"good","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":7,"name":"Dasun Shanaka","role":"ALL","basePrice":1.5,"ratings":{"bat":68,"bowl":68,"field":72,"keep":0},"form":68,"injuryProne":25,"tier":"good","country":"SL","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":7,"name":"Krunal Pandya","role":"ALL","basePrice":1.5,"ratings":{"bat":66,"bowl":72,"field":78,"keep":0},"form":70,"injuryProne":28,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":7,"name":"Jacob Bethell","role":"ALL","basePrice":1.5,"ratings":{"bat":72,"bowl":66,"field":78,"keep":0},"form":78,"injuryProne":18,"tier":"good","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":7,"name":"Tim David","role":"ALL","basePrice":1.5,"ratings":{"bat":80,"bowl":20,"field":76,"keep":0},"form":78,"injuryProne":22,"tier":"good","country":"SGP","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":7,"name":"Will Jacks","role":"ALL","basePrice":1.5,"ratings":{"bat":72,"bowl":70,"field":76,"keep":0},"form":74,"injuryProne":20,"tier":"good","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":7,"name":"Washington Sundar","role":"ALL","basePrice":1.5,"ratings":{"bat":64,"bowl":72,"field":78,"keep":0},"form":74,"injuryProne":28,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":8,"name":"Sam Billings","role":"WK","basePrice":1.5,"ratings":{"bat":72,"bowl":0,"field":76,"keep":78},"form":72,"injuryProne":28,"tier":"good","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":8,"name":"Donovan Ferreira","role":"WK","basePrice":1.5,"ratings":{"bat":68,"bowl":0,"field":74,"keep":74},"form":68,"injuryProne":20,"tier":"good","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":8,"name":"Shai Hope","role":"WK","basePrice":1.5,"ratings":{"bat":70,"bowl":0,"field":72,"keep":74},"form":68,"injuryProne":22,"tier":"good","country":"WI","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":8,"name":"Tim Seifert","role":"WK","basePrice":1.5,"ratings":{"bat":70,"bowl":0,"field":72,"keep":74},"form":68,"injuryProne":22,"tier":"good","country":"NZ","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":8,"name":"Jordan Cox","role":"WK","basePrice":1.5,"ratings":{"bat":68,"bowl":0,"field":72,"keep":74},"form":68,"injuryProne":20,"tier":"good","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":8,"name":"Sarfaraz Khan","role":"WK","basePrice":1.5,"ratings":{"bat":72,"bowl":0,"field":72,"keep":72},"form":72,"injuryProne":25,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":8,"name":"Tom Banton","role":"WK","basePrice":1.5,"ratings":{"bat":70,"bowl":0,"field":72,"keep":72},"form":66,"injuryProne":28,"tier":"good","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":8,"name":"Jitesh Sharma","role":"WK","basePrice":1.5,"ratings":{"bat":70,"bowl":0,"field":74,"keep":74},"form":72,"injuryProne":22,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Harshal Patel","role":"PACE","basePrice":1.5,"ratings":{"bat":25,"bowl":79,"field":66,"keep":0},"form":74,"injuryProne":42,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Nandre Burger","role":"PACE","basePrice":1.5,"ratings":{"bat":18,"bowl":74,"field":64,"keep":0},"form":72,"injuryProne":28,"tier":"good","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Jacob Duffy","role":"PACE","basePrice":1.5,"ratings":{"bat":18,"bowl":72,"field":64,"keep":0},"form":70,"injuryProne":25,"tier":"good","country":"NZ","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Spencer Johnson","role":"PACE","basePrice":1.5,"ratings":{"bat":18,"bowl":74,"field":64,"keep":0},"form":74,"injuryProne":25,"tier":"good","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Mukesh Kumar","role":"PACE","basePrice":1.5,"ratings":{"bat":15,"bowl":74,"field":62,"keep":0},"form":72,"injuryProne":30,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Fazalhaq Farooqi","role":"PACE","basePrice":1.5,"ratings":{"bat":15,"bowl":78,"field":62,"keep":0},"form":78,"injuryProne":25,"tier":"good","country":"AFG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Ishant Sharma","role":"PACE","basePrice":1.5,"ratings":{"bat":20,"bowl":72,"field":62,"keep":0},"form":62,"injuryProne":45,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Dushmantha Chameera","role":"PACE","basePrice":1.5,"ratings":{"bat":18,"bowl":72,"field":62,"keep":0},"form":68,"injuryProne":45,"tier":"good","country":"SL","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Avesh Khan","role":"PACE","basePrice":1.5,"ratings":{"bat":18,"bowl":74,"field":62,"keep":0},"form":72,"injuryProne":38,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Kyle Jamieson","role":"PACE","basePrice":1.5,"ratings":{"bat":35,"bowl":76,"field":64,"keep":0},"form":72,"injuryProne":40,"tier":"good","country":"NZ","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Khaleel Ahmed","role":"PACE","basePrice":1.5,"ratings":{"bat":15,"bowl":73,"field":62,"keep":0},"form":70,"injuryProne":40,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Mark Wood","role":"PACE","basePrice":1.5,"ratings":{"bat":22,"bowl":82,"field":64,"keep":0},"form":72,"injuryProne":75,"tier":"good","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Chris Jordan","role":"PACE","basePrice":1.5,"ratings":{"bat":25,"bowl":76,"field":68,"keep":0},"form":72,"injuryProne":35,"tier":"good","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Naveen ul Haq","role":"PACE","basePrice":1.5,"ratings":{"bat":18,"bowl":75,"field":62,"keep":0},"form":74,"injuryProne":25,"tier":"good","country":"AFG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Alzarri Joseph","role":"PACE","basePrice":1.5,"ratings":{"bat":22,"bowl":78,"field":64,"keep":0},"form":74,"injuryProne":38,"tier":"good","country":"WI","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Gerald Coetzee","role":"PACE","basePrice":1.5,"ratings":{"bat":18,"bowl":76,"field":62,"keep":0},"form":74,"injuryProne":28,"tier":"good","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Nathan Ellis","role":"PACE","basePrice":1.5,"ratings":{"bat":18,"bowl":74,"field":62,"keep":0},"form":72,"injuryProne":28,"tier":"good","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Xavier Bartlett","role":"PACE","basePrice":1.5,"ratings":{"bat":18,"bowl":73,"field":62,"keep":0},"form":72,"injuryProne":22,"tier":"good","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Adam Milne","role":"PACE","basePrice":1.5,"ratings":{"bat":18,"bowl":72,"field":62,"keep":0},"form":68,"injuryProne":48,"tier":"good","country":"NZ","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Nuwan Thusara","role":"PACE","basePrice":1.5,"ratings":{"bat":15,"bowl":72,"field":60,"keep":0},"form":70,"injuryProne":28,"tier":"good","country":"SL","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":9,"name":"Jaydev Unadkat","role":"PACE","basePrice":1.5,"ratings":{"bat":22,"bowl":72,"field":62,"keep":0},"form":68,"injuryProne":38,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":10,"name":"Rahul Chahar","role":"SPIN","basePrice":1.5,"ratings":{"bat":14,"bowl":76,"field":60,"keep":0},"form":72,"injuryProne":32,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":10,"name":"Mujeeb Ur Rahman","role":"SPIN","basePrice":1.5,"ratings":{"bat":12,"bowl":79,"field":60,"keep":0},"form":76,"injuryProne":25,"tier":"good","country":"AFG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":10,"name":"Tabraiz Shamsi","role":"SPIN","basePrice":1.5,"ratings":{"bat":12,"bowl":78,"field":58,"keep":0},"form":74,"injuryProne":22,"tier":"good","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":10,"name":"Shreyas Gopal","role":"SPIN","basePrice":1.5,"ratings":{"bat":24,"bowl":74,"field":60,"keep":0},"form":68,"injuryProne":28,"tier":"good","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":10,"name":"George Linde","role":"ALL","basePrice":1.5,"ratings":{"bat":48,"bowl":72,"field":64,"keep":0},"form":68,"injuryProne":25,"tier":"good","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":11,"name":"Aniket Verma","role":"BAT","basePrice":1.0,"ratings":{"bat":68,"bowl":12,"field":72,"keep":0},"form":70,"injuryProne":20,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":11,"name":"Rovman Powell","role":"BAT","basePrice":1.0,"ratings":{"bat":72,"bowl":12,"field":70,"keep":0},"form":72,"injuryProne":22,"tier":"mid","country":"WI","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":11,"name":"Sherfane Rutherford","role":"BAT","basePrice":1.0,"ratings":{"bat":68,"bowl":12,"field":70,"keep":0},"form":70,"injuryProne":22,"tier":"mid","country":"WI","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":11,"name":"Mayank Agarwal","role":"BAT","basePrice":1.0,"ratings":{"bat":70,"bowl":12,"field":72,"keep":0},"form":64,"injuryProne":28,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":11,"name":"Angkrish Raghuvanshi","role":"BAT","basePrice":1.0,"ratings":{"bat":66,"bowl":12,"field":72,"keep":0},"form":72,"injuryProne":18,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":11,"name":"Vaibhav Suryavanshi","role":"BAT","basePrice":1.0,"ratings":{"bat":68,"bowl":12,"field":72,"keep":0},"form":76,"injuryProne":18,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":11,"name":"Nehal Wadhera","role":"BAT","basePrice":1.0,"ratings":{"bat":65,"bowl":12,"field":70,"keep":0},"form":68,"injuryProne":20,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":11,"name":"Aayush Mhatre","role":"BAT","basePrice":1.0,"ratings":{"bat":64,"bowl":12,"field":70,"keep":0},"form":70,"injuryProne":18,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":11,"name":"Priyansh Arya","role":"BAT","basePrice":1.0,"ratings":{"bat":66,"bowl":12,"field":70,"keep":0},"form":72,"injuryProne":18,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":11,"name":"Matthew Breetzke","role":"BAT","basePrice":1.0,"ratings":{"bat":65,"bowl":12,"field":70,"keep":0},"form":68,"injuryProne":20,"tier":"mid","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":11,"name":"Reeza Hendricks","role":"BAT","basePrice":1.0,"ratings":{"bat":66,"bowl":12,"field":68,"keep":0},"form":66,"injuryProne":25,"tier":"mid","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":11,"name":"Rahul Tripathi","role":"BAT","basePrice":1.0,"ratings":{"bat":68,"bowl":12,"field":70,"keep":0},"form":66,"injuryProne":22,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":11,"name":"Deepak Hooda","role":"ALL","basePrice":1.0,"ratings":{"bat":67,"bowl":32,"field":70,"keep":0},"form":64,"injuryProne":28,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":11,"name":"Rahul Tewatia","role":"ALL","basePrice":1.0,"ratings":{"bat":66,"bowl":58,"field":68,"keep":0},"form":68,"injuryProne":28,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":11,"name":"Shah Rukh Khan","role":"BAT","basePrice":1.0,"ratings":{"bat":66,"bowl":12,"field":70,"keep":0},"form":68,"injuryProne":22,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":11,"name":"Mark Chapman","role":"BAT","basePrice":1.0,"ratings":{"bat":64,"bowl":12,"field":68,"keep":0},"form":64,"injuryProne":25,"tier":"mid","country":"NZ","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":12,"name":"Sameer Rizvi","role":"ALL","basePrice":1.0,"ratings":{"bat":62,"bowl":56,"field":70,"keep":0},"form":68,"injuryProne":18,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":12,"name":"Shahbaz Ahmed","role":"ALL","basePrice":1.0,"ratings":{"bat":60,"bowl":64,"field":70,"keep":0},"form":66,"injuryProne":22,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":12,"name":"Chris Green","role":"ALL","basePrice":1.0,"ratings":{"bat":48,"bowl":66,"field":68,"keep":0},"form":64,"injuryProne":22,"tier":"mid","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":12,"name":"Krishnappa Gowtham","role":"ALL","basePrice":1.0,"ratings":{"bat":52,"bowl":64,"field":66,"keep":0},"form":62,"injuryProne":28,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":12,"name":"Naman Dhir","role":"ALL","basePrice":1.0,"ratings":{"bat":60,"bowl":56,"field":68,"keep":0},"form":66,"injuryProne":18,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":12,"name":"Mahipal Lomror","role":"ALL","basePrice":1.0,"ratings":{"bat":62,"bowl":58,"field":68,"keep":0},"form":62,"injuryProne":22,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":12,"name":"Ashutosh Sharma","role":"ALL","basePrice":1.0,"ratings":{"bat":62,"bowl":58,"field":70,"keep":0},"form":68,"injuryProne":18,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":12,"name":"Harpreet Brar","role":"ALL","basePrice":1.0,"ratings":{"bat":52,"bowl":66,"field":68,"keep":0},"form":64,"injuryProne":22,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":12,"name":"Vipraj Nigam","role":"ALL","basePrice":1.0,"ratings":{"bat":48,"bowl":64,"field":66,"keep":0},"form":64,"injuryProne":18,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":12,"name":"Jayant Yadav","role":"ALL","basePrice":1.0,"ratings":{"bat":50,"bowl":66,"field":66,"keep":0},"form":62,"injuryProne":25,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":12,"name":"Abdul Samad","role":"ALL","basePrice":1.0,"ratings":{"bat":64,"bowl":52,"field":68,"keep":0},"form":66,"injuryProne":20,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":12,"name":"Musheer Khan","role":"ALL","basePrice":1.0,"ratings":{"bat":62,"bowl":58,"field":68,"keep":0},"form":70,"injuryProne":18,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":12,"name":"Swapnil Singh","role":"ALL","basePrice":1.0,"ratings":{"bat":48,"bowl":64,"field":64,"keep":0},"form":60,"injuryProne":22,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":12,"name":"Brydon Carse","role":"ALL","basePrice":1.0,"ratings":{"bat":58,"bowl":68,"field":68,"keep":0},"form":70,"injuryProne":28,"tier":"mid","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":12,"name":"Gulbadin Naib","role":"ALL","basePrice":1.0,"ratings":{"bat":54,"bowl":64,"field":64,"keep":0},"form":62,"injuryProne":22,"tier":"mid","country":"AFG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":12,"name":"Vijay Shankar","role":"ALL","basePrice":1.0,"ratings":{"bat":58,"bowl":62,"field":66,"keep":0},"form":60,"injuryProne":35,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":13,"name":"KS Bharat","role":"WK","basePrice":1.0,"ratings":{"bat":60,"bowl":0,"field":68,"keep":74},"form":62,"injuryProne":22,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":13,"name":"Alex Carey","role":"WK","basePrice":1.0,"ratings":{"bat":65,"bowl":0,"field":70,"keep":78},"form":68,"injuryProne":22,"tier":"mid","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":13,"name":"Prabhsimran Singh","role":"WK","basePrice":1.0,"ratings":{"bat":68,"bowl":0,"field":70,"keep":72},"form":70,"injuryProne":18,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":13,"name":"Kartik Sharma","role":"WK","basePrice":1.0,"ratings":{"bat":56,"bowl":0,"field":64,"keep":66},"form":60,"injuryProne":20,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":13,"name":"Abhishek Porel","role":"WK","basePrice":1.0,"ratings":{"bat":64,"bowl":0,"field":68,"keep":70},"form":66,"injuryProne":18,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":13,"name":"Anuj Rawat","role":"WK","basePrice":1.0,"ratings":{"bat":60,"bowl":0,"field":66,"keep":68},"form":62,"injuryProne":22,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":13,"name":"Kumar Kushagra","role":"WK","basePrice":1.0,"ratings":{"bat":60,"bowl":0,"field":66,"keep":70},"form":64,"injuryProne":18,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":13,"name":"Lhuandre Pretorius","role":"WK","basePrice":1.0,"ratings":{"bat":58,"bowl":0,"field":64,"keep":66},"form":60,"injuryProne":20,"tier":"mid","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":13,"name":"MS Dhoni","role":"WK","basePrice":1.0,"ratings":{"bat":66,"bowl":0,"field":72,"keep":88},"form":62,"injuryProne":38,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Vaibhav Arora","role":"PACE","basePrice":1.0,"ratings":{"bat":15,"bowl":70,"field":60,"keep":0},"form":70,"injuryProne":28,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Mohit Sharma","role":"PACE","basePrice":1.0,"ratings":{"bat":15,"bowl":72,"field":60,"keep":0},"form":68,"injuryProne":35,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Vyshak Vijaykumar","role":"PACE","basePrice":1.0,"ratings":{"bat":15,"bowl":70,"field":60,"keep":0},"form":68,"injuryProne":22,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Joshua Little","role":"PACE","basePrice":1.0,"ratings":{"bat":15,"bowl":73,"field":60,"keep":0},"form":70,"injuryProne":28,"tier":"mid","country":"IRE","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Tushar Deshpande","role":"PACE","basePrice":1.0,"ratings":{"bat":15,"bowl":70,"field":60,"keep":0},"form":68,"injuryProne":28,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Akash Deep","role":"PACE","basePrice":1.0,"ratings":{"bat":18,"bowl":72,"field":60,"keep":0},"form":70,"injuryProne":25,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Umran Malik","role":"PACE","basePrice":1.0,"ratings":{"bat":12,"bowl":72,"field":58,"keep":0},"form":64,"injuryProne":55,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Dilshan Madushanka","role":"PACE","basePrice":1.0,"ratings":{"bat":15,"bowl":70,"field":60,"keep":0},"form":68,"injuryProne":32,"tier":"mid","country":"SL","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Shivam Mavi","role":"PACE","basePrice":1.0,"ratings":{"bat":22,"bowl":70,"field":60,"keep":0},"form":68,"injuryProne":38,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Navdeep Saini","role":"PACE","basePrice":1.0,"ratings":{"bat":15,"bowl":68,"field":58,"keep":0},"form":62,"injuryProne":52,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Reece Topley","role":"PACE","basePrice":1.0,"ratings":{"bat":12,"bowl":70,"field":58,"keep":0},"form":66,"injuryProne":58,"tier":"mid","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Mayank Yadav","role":"PACE","basePrice":1.0,"ratings":{"bat":12,"bowl":74,"field":58,"keep":0},"form":72,"injuryProne":40,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Mohsin Khan","role":"PACE","basePrice":1.0,"ratings":{"bat":15,"bowl":70,"field":58,"keep":0},"form":64,"injuryProne":40,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Blessing Muzarabani","role":"PACE","basePrice":1.0,"ratings":{"bat":15,"bowl":70,"field":60,"keep":0},"form":66,"injuryProne":28,"tier":"mid","country":"ZIM","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Yash Dayal","role":"PACE","basePrice":1.0,"ratings":{"bat":15,"bowl":68,"field":58,"keep":0},"form":66,"injuryProne":32,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Kweena Maphaka","role":"PACE","basePrice":1.0,"ratings":{"bat":12,"bowl":68,"field":58,"keep":0},"form":64,"injuryProne":22,"tier":"mid","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Ishan Malinga","role":"PACE","basePrice":1.0,"ratings":{"bat":15,"bowl":64,"field":58,"keep":0},"form":60,"injuryProne":25,"tier":"mid","country":"NZ","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Matheesha Pathirana","role":"PACE","basePrice":1.0,"ratings":{"bat":12,"bowl":78,"field":58,"keep":0},"form":80,"injuryProne":28,"tier":"mid","country":"SL","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Riley Meredith","role":"PACE","basePrice":1.0,"ratings":{"bat":12,"bowl":68,"field":58,"keep":0},"form":64,"injuryProne":40,"tier":"mid","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Kamlesh Nagarkoti","role":"PACE","basePrice":1.0,"ratings":{"bat":12,"bowl":67,"field":58,"keep":0},"form":62,"injuryProne":50,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Gus Atkinson","role":"PACE","basePrice":1.0,"ratings":{"bat":30,"bowl":72,"field":62,"keep":0},"form":72,"injuryProne":30,"tier":"mid","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Tom Curran","role":"ALL","basePrice":1.0,"ratings":{"bat":46,"bowl":68,"field":64,"keep":0},"form":62,"injuryProne":38,"tier":"mid","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Jason Behrendorff","role":"PACE","basePrice":1.0,"ratings":{"bat":12,"bowl":70,"field":58,"keep":0},"form":64,"injuryProne":42,"tier":"mid","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Will O'Rourke","role":"PACE","basePrice":1.0,"ratings":{"bat":12,"bowl":70,"field":58,"keep":0},"form":68,"injuryProne":22,"tier":"mid","country":"NZ","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"James Anderson","role":"PACE","basePrice":1.0,"ratings":{"bat":15,"bowl":65,"field":58,"keep":0},"form":54,"injuryProne":40,"tier":"mid","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Richard Gleeson","role":"PACE","basePrice":1.0,"ratings":{"bat":12,"bowl":64,"field":56,"keep":0},"form":60,"injuryProne":40,"tier":"mid","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Ottneil Baartman","role":"PACE","basePrice":1.0,"ratings":{"bat":12,"bowl":66,"field":58,"keep":0},"form":62,"injuryProne":28,"tier":"mid","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":14,"name":"Rishi Dhawan","role":"ALL","basePrice":1.0,"ratings":{"bat":30,"bowl":64,"field":60,"keep":0},"form":58,"injuryProne":32,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":15,"name":"Suyash Sharma","role":"SPIN","basePrice":1.0,"ratings":{"bat":12,"bowl":72,"field":58,"keep":0},"form":70,"injuryProne":22,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":15,"name":"Matthew Kuhnemann","role":"SPIN","basePrice":1.0,"ratings":{"bat":20,"bowl":70,"field":58,"keep":0},"form":68,"injuryProne":22,"tier":"mid","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":15,"name":"Zeeshan Ansari","role":"SPIN","basePrice":1.0,"ratings":{"bat":12,"bowl":68,"field":56,"keep":0},"form":66,"injuryProne":20,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":15,"name":"Digvesh Singh","role":"SPIN","basePrice":1.0,"ratings":{"bat":12,"bowl":68,"field":56,"keep":0},"form":66,"injuryProne":18,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":15,"name":"Mayank Markande","role":"SPIN","basePrice":1.0,"ratings":{"bat":12,"bowl":68,"field":58,"keep":0},"form":62,"injuryProne":25,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":15,"name":"Karn Sharma","role":"SPIN","basePrice":1.0,"ratings":{"bat":18,"bowl":68,"field":58,"keep":0},"form":60,"injuryProne":28,"tier":"mid","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":15,"name":"Allah Ghazanfar","role":"SPIN","basePrice":1.0,"ratings":{"bat":12,"bowl":72,"field":58,"keep":0},"form":72,"injuryProne":18,"tier":"mid","country":"AFG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":16,"name":"Abhinav Manohar","role":"BAT","basePrice":0.5,"ratings":{"bat":62,"bowl":20,"field":70,"keep":0},"form":64,"injuryProne":22,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":16,"name":"Atharva Taide","role":"BAT","basePrice":0.5,"ratings":{"bat":60,"bowl":18,"field":68,"keep":0},"form":62,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":16,"name":"Yash Dhull","role":"BAT","basePrice":0.5,"ratings":{"bat":60,"bowl":12,"field":68,"keep":0},"form":62,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":16,"name":"Anmolpreet Singh","role":"BAT","basePrice":0.5,"ratings":{"bat":58,"bowl":12,"field":66,"keep":0},"form":60,"injuryProne":22,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":16,"name":"Shubham Dubey","role":"ALL","basePrice":0.5,"ratings":{"bat":58,"bowl":28,"field":66,"keep":0},"form":60,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":16,"name":"Shaik Rasheed","role":"BAT","basePrice":0.5,"ratings":{"bat":56,"bowl":12,"field":64,"keep":0},"form":58,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":16,"name":"Priyam Garg","role":"BAT","basePrice":0.5,"ratings":{"bat":58,"bowl":12,"field":64,"keep":0},"form":60,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":16,"name":"Manan Vohra","role":"BAT","basePrice":0.5,"ratings":{"bat":58,"bowl":12,"field":64,"keep":0},"form":58,"injuryProne":25,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":16,"name":"Harpreet Bhatia","role":"BAT","basePrice":0.5,"ratings":{"bat":56,"bowl":12,"field":62,"keep":0},"form":58,"injuryProne":22,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":16,"name":"Himmat Singh","role":"BAT","basePrice":0.5,"ratings":{"bat":56,"bowl":12,"field":62,"keep":0},"form":60,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":16,"name":"Kunal Rathore","role":"BAT","basePrice":0.5,"ratings":{"bat":54,"bowl":12,"field":62,"keep":0},"form":56,"injuryProne":22,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":16,"name":"Swastik Chikara","role":"BAT","basePrice":0.5,"ratings":{"bat":54,"bowl":12,"field":62,"keep":0},"form":58,"injuryProne":18,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":16,"name":"Raj Angad Bawa","role":"ALL","basePrice":0.5,"ratings":{"bat":60,"bowl":30,"field":66,"keep":0},"form":60,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Roston Chase","role":"ALL","basePrice":0.5,"ratings":{"bat":60,"bowl":62,"field":68,"keep":0},"form":62,"injuryProne":25,"tier":"budget","country":"WI","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Qais Ahmad","role":"SPIN","basePrice":0.5,"ratings":{"bat":22,"bowl":66,"field":60,"keep":0},"form":64,"injuryProne":22,"tier":"budget","country":"AFG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Charith Asalanka","role":"ALL","basePrice":0.5,"ratings":{"bat":64,"bowl":48,"field":68,"keep":0},"form":66,"injuryProne":22,"tier":"budget","country":"SL","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Dunith Wellalage","role":"ALL","basePrice":0.5,"ratings":{"bat":52,"bowl":64,"field":62,"keep":0},"form":68,"injuryProne":18,"tier":"budget","country":"SL","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Odean Smith","role":"ALL","basePrice":0.5,"ratings":{"bat":60,"bowl":62,"field":66,"keep":0},"form":64,"injuryProne":22,"tier":"budget","country":"WI","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Karim Janat","role":"ALL","basePrice":0.5,"ratings":{"bat":52,"bowl":60,"field":62,"keep":0},"form":60,"injuryProne":22,"tier":"budget","country":"AFG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Nishant Sindhu","role":"ALL","basePrice":0.5,"ratings":{"bat":48,"bowl":58,"field":64,"keep":0},"form":60,"injuryProne":18,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Hrithik Shokeen","role":"ALL","basePrice":0.5,"ratings":{"bat":42,"bowl":62,"field":60,"keep":0},"form":58,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Vicky Ostwal","role":"SPIN","basePrice":0.5,"ratings":{"bat":28,"bowl":62,"field":58,"keep":0},"form":62,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Shivalik Sharma","role":"ALL","basePrice":0.5,"ratings":{"bat":44,"bowl":60,"field":60,"keep":0},"form":58,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Ripal Patel","role":"ALL","basePrice":0.5,"ratings":{"bat":52,"bowl":56,"field":62,"keep":0},"form":58,"injuryProne":22,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Aman Khan","role":"ALL","basePrice":0.5,"ratings":{"bat":44,"bowl":60,"field":60,"keep":0},"form":58,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Suyash Prabhudessai","role":"BAT","basePrice":0.5,"ratings":{"bat":54,"bowl":48,"field":62,"keep":0},"form":60,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Anukul Roy","role":"ALL","basePrice":0.5,"ratings":{"bat":46,"bowl":60,"field":60,"keep":0},"form":58,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Sanvir Singh","role":"ALL","basePrice":0.5,"ratings":{"bat":46,"bowl":58,"field":60,"keep":0},"form":58,"injuryProne":18,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Manoj Bhandage","role":"ALL","basePrice":0.5,"ratings":{"bat":44,"bowl":58,"field":58,"keep":0},"form":56,"injuryProne":22,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Shivam Singh","role":"ALL","basePrice":0.5,"ratings":{"bat":54,"bowl":54,"field":62,"keep":0},"form":58,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Mohit Rathee","role":"ALL","basePrice":0.5,"ratings":{"bat":50,"bowl":56,"field":60,"keep":0},"form":58,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Ajay Mandal","role":"ALL","basePrice":0.5,"ratings":{"bat":44,"bowl":60,"field":58,"keep":0},"form":56,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Bhagath Varma","role":"ALL","basePrice":0.5,"ratings":{"bat":52,"bowl":54,"field":62,"keep":0},"form":60,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Praveen Dubey","role":"ALL","basePrice":0.5,"ratings":{"bat":38,"bowl":62,"field":56,"keep":0},"form":58,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Prashant Veer","role":"PACE","basePrice":0.5,"ratings":{"bat":18,"bowl":62,"field":56,"keep":0},"form":58,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Zak Foulkes","role":"PACE","basePrice":0.5,"ratings":{"bat":20,"bowl":62,"field":60,"keep":0},"form":60,"injuryProne":22,"tier":"budget","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Mohd. Arshad Khan","role":"PACE","basePrice":0.5,"ratings":{"bat":16,"bowl":60,"field":56,"keep":0},"form":58,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Daksh Kamra","role":"ALL","basePrice":0.5,"ratings":{"bat":52,"bowl":52,"field":62,"keep":0},"form":60,"injuryProne":18,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Arshin Kulkarni","role":"ALL","basePrice":0.5,"ratings":{"bat":50,"bowl":56,"field":62,"keep":0},"form":60,"injuryProne":18,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Mayank Rawar","role":"ALL","basePrice":0.5,"ratings":{"bat":48,"bowl":56,"field":60,"keep":0},"form":58,"injuryProne":18,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Yudhvir Singh Charak","role":"PACE","basePrice":0.5,"ratings":{"bat":18,"bowl":62,"field":58,"keep":0},"form":60,"injuryProne":18,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Suryansh Shedge","role":"ALL","basePrice":0.5,"ratings":{"bat":50,"bowl":52,"field":60,"keep":0},"form":58,"injuryProne":18,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Mangesh Yadav","role":"PACE","basePrice":0.5,"ratings":{"bat":16,"bowl":64,"field":56,"keep":0},"form":60,"injuryProne":18,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Vihaan Malhotra","role":"ALL","basePrice":0.5,"ratings":{"bat":52,"bowl":50,"field":60,"keep":0},"form":58,"injuryProne":18,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Satvik Deshwal","role":"BAT","basePrice":0.5,"ratings":{"bat":50,"bowl":12,"field":60,"keep":0},"form":58,"injuryProne":18,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"Harsh Dubey","role":"PACE","basePrice":0.5,"ratings":{"bat":16,"bowl":62,"field":56,"keep":0},"form":58,"injuryProne":18,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":17,"name":"David Wiese","role":"ALL","basePrice":0.5,"ratings":{"bat":54,"bowl":60,"field":62,"keep":0},"form":58,"injuryProne":25,"tier":"budget","country":"SA","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":18,"name":"Mukul Choudhary","role":"WK","basePrice":0.5,"ratings":{"bat":44,"bowl":0,"field":60,"keep":62},"form":54,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":18,"name":"Josh Philippe","role":"WK","basePrice":0.5,"ratings":{"bat":62,"bowl":0,"field":68,"keep":70},"form":64,"injuryProne":22,"tier":"budget","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":18,"name":"Ben McDermott","role":"WK","basePrice":0.5,"ratings":{"bat":60,"bowl":0,"field":66,"keep":68},"form":62,"injuryProne":22,"tier":"budget","country":"AUS","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":18,"name":"Kusal Mendis","role":"WK","basePrice":0.5,"ratings":{"bat":62,"bowl":0,"field":68,"keep":70},"form":66,"injuryProne":22,"tier":"budget","country":"SL","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":18,"name":"Johnson Charles","role":"WK","basePrice":0.5,"ratings":{"bat":62,"bowl":0,"field":66,"keep":68},"form":60,"injuryProne":25,"tier":"budget","country":"WI","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":18,"name":"Ravi Singh","role":"WK","basePrice":0.5,"ratings":{"bat":50,"bowl":0,"field":62,"keep":64},"form":54,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":18,"name":"Litton Das","role":"WK","basePrice":0.5,"ratings":{"bat":60,"bowl":0,"field":66,"keep":68},"form":62,"injuryProne":22,"tier":"budget","country":"BAN","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":18,"name":"Ollie Pope","role":"WK","basePrice":0.5,"ratings":{"bat":62,"bowl":0,"field":66,"keep":68},"form":64,"injuryProne":28,"tier":"budget","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":18,"name":"Niroshan Dickwella","role":"WK","basePrice":0.5,"ratings":{"bat":58,"bowl":0,"field":64,"keep":68},"form":56,"injuryProne":25,"tier":"budget","country":"SL","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":18,"name":"Robin Minz","role":"WK","basePrice":0.5,"ratings":{"bat":52,"bowl":0,"field":62,"keep":64},"form":58,"injuryProne":18,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":18,"name":"Andre Fletcher","role":"WK","basePrice":0.5,"ratings":{"bat":58,"bowl":0,"field":64,"keep":64},"form":58,"injuryProne":25,"tier":"budget","country":"WI","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":18,"name":"Vishnu Vinod","role":"WK","basePrice":0.5,"ratings":{"bat":54,"bowl":0,"field":62,"keep":64},"form":58,"injuryProne":22,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":18,"name":"Kusal Perera","role":"WK","basePrice":0.5,"ratings":{"bat":58,"bowl":0,"field":64,"keep":66},"form":58,"injuryProne":28,"tier":"budget","country":"SL","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":18,"name":"Salil Arora","role":"WK","basePrice":0.5,"ratings":{"bat":44,"bowl":0,"field":58,"keep":60},"form":52,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":18,"name":"Narayan Jagadeesan","role":"WK","basePrice":0.5,"ratings":{"bat":56,"bowl":0,"field":64,"keep":66},"form":58,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":18,"name":"Sheldon Jackson","role":"WK","basePrice":0.5,"ratings":{"bat":54,"bowl":0,"field":62,"keep":66},"form":56,"injuryProne":25,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":18,"name":"Tom Kohler-Cadmore","role":"WK","basePrice":0.5,"ratings":{"bat":56,"bowl":0,"field":62,"keep":64},"form":56,"injuryProne":28,"tier":"budget","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":18,"name":"Upendra Yadav","role":"WK","basePrice":0.5,"ratings":{"bat":54,"bowl":0,"field":62,"keep":66},"form":58,"injuryProne":18,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":18,"name":"Urvil Patel","role":"WK","basePrice":0.5,"ratings":{"bat":56,"bowl":0,"field":64,"keep":64},"form":58,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":18,"name":"Harvik Desai","role":"WK","basePrice":0.5,"ratings":{"bat":52,"bowl":0,"field":60,"keep":64},"form":56,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Chetan Sakariya","role":"PACE","basePrice":0.5,"ratings":{"bat":14,"bowl":64,"field":56,"keep":0},"form":62,"injuryProne":35,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Kuldeep Sen","role":"PACE","basePrice":0.5,"ratings":{"bat":12,"bowl":64,"field":54,"keep":0},"form":62,"injuryProne":32,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Kartik Tyagi","role":"PACE","basePrice":0.5,"ratings":{"bat":12,"bowl":62,"field":54,"keep":0},"form":58,"injuryProne":35,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Akash Madhwal","role":"PACE","basePrice":0.5,"ratings":{"bat":12,"bowl":66,"field":54,"keep":0},"form":62,"injuryProne":28,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Yash Thakur","role":"PACE","basePrice":0.5,"ratings":{"bat":12,"bowl":62,"field":54,"keep":0},"form":60,"injuryProne":22,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Simarjeet Singh","role":"PACE","basePrice":0.5,"ratings":{"bat":12,"bowl":62,"field":54,"keep":0},"form":60,"injuryProne":25,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Mukesh Choudhary","role":"PACE","basePrice":0.5,"ratings":{"bat":12,"bowl":62,"field":54,"keep":0},"form":58,"injuryProne":32,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Arjun Tendulkar","role":"PACE","basePrice":0.5,"ratings":{"bat":20,"bowl":60,"field":56,"keep":0},"form":58,"injuryProne":25,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Kuldip Yadav","role":"PACE","basePrice":0.5,"ratings":{"bat":12,"bowl":60,"field":54,"keep":0},"form":56,"injuryProne":25,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Rasikh Dar","role":"PACE","basePrice":0.5,"ratings":{"bat":12,"bowl":62,"field":54,"keep":0},"form":60,"injuryProne":28,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Sakib Hussain","role":"PACE","basePrice":0.5,"ratings":{"bat":12,"bowl":60,"field":52,"keep":0},"form":56,"injuryProne":22,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Gurnoor Brar","role":"PACE","basePrice":0.5,"ratings":{"bat":14,"bowl":62,"field":54,"keep":0},"form":60,"injuryProne":22,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Prince Yadav","role":"PACE","basePrice":0.5,"ratings":{"bat":12,"bowl":58,"field":52,"keep":0},"form":54,"injuryProne":22,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Gurjapneet Singh","role":"PACE","basePrice":0.5,"ratings":{"bat":12,"bowl":60,"field":52,"keep":0},"form":56,"injuryProne":22,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Praful Hinge","role":"PACE","basePrice":0.5,"ratings":{"bat":12,"bowl":58,"field":52,"keep":0},"form":54,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Abhinandan Singh","role":"PACE","basePrice":0.5,"ratings":{"bat":12,"bowl":58,"field":52,"keep":0},"form":54,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Brijesh Sharma","role":"PACE","basePrice":0.5,"ratings":{"bat":12,"bowl":58,"field":52,"keep":0},"form":54,"injuryProne":22,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Ashwani Kumar","role":"PACE","basePrice":0.5,"ratings":{"bat":12,"bowl":58,"field":52,"keep":0},"form":54,"injuryProne":22,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Akash Singh","role":"PACE","basePrice":0.5,"ratings":{"bat":12,"bowl":60,"field":52,"keep":0},"form":56,"injuryProne":22,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Ashok Sharma","role":"PACE","basePrice":0.5,"ratings":{"bat":14,"bowl":58,"field":52,"keep":0},"form":54,"injuryProne":25,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Luke Wood","role":"PACE","basePrice":0.5,"ratings":{"bat":20,"bowl":62,"field":54,"keep":0},"form":60,"injuryProne":35,"tier":"budget","country":"ENG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Kulwant Khejroliya","role":"PACE","basePrice":0.5,"ratings":{"bat":12,"bowl":60,"field":52,"keep":0},"form":56,"injuryProne":25,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Auqib Nabi","role":"PACE","basePrice":0.5,"ratings":{"bat":12,"bowl":62,"field":52,"keep":0},"form":58,"injuryProne":22,"tier":"budget","country":"AFG","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":19,"name":"Anshul Kamboj","role":"PACE","basePrice":0.5,"ratings":{"bat":14,"bowl":62,"field":52,"keep":0},"form":60,"injuryProne":22,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":20,"name":"Mayank Dagar","role":"SPIN","basePrice":0.5,"ratings":{"bat":18,"bowl":64,"field":54,"keep":0},"form":62,"injuryProne":22,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":20,"name":"KC Cariappa","role":"SPIN","basePrice":0.5,"ratings":{"bat":14,"bowl":62,"field":52,"keep":0},"form":58,"injuryProne":22,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":20,"name":"Shams Mulani","role":"SPIN","basePrice":0.5,"ratings":{"bat":20,"bowl":64,"field":54,"keep":0},"form":60,"injuryProne":22,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":20,"name":"Sai Kishore","role":"SPIN","basePrice":0.5,"ratings":{"bat":14,"bowl":66,"field":54,"keep":0},"form":62,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":20,"name":"Vignesh Puthar","role":"SPIN","basePrice":0.5,"ratings":{"bat":14,"bowl":62,"field":52,"keep":0},"form":58,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":20,"name":"Kumar Kartikeya","role":"SPIN","basePrice":0.5,"ratings":{"bat":14,"bowl":62,"field":52,"keep":0},"form":58,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":20,"name":"M. Siddharth","role":"SPIN","basePrice":0.5,"ratings":{"bat":14,"bowl":62,"field":52,"keep":0},"form":58,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":20,"name":"Prashant Solanki","role":"SPIN","basePrice":0.5,"ratings":{"bat":18,"bowl":62,"field":52,"keep":0},"form":56,"injuryProne":22,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100},{"csvSet":20,"name":"Yashraj Punja","role":"SPIN","basePrice":0.5,"ratings":{"bat":14,"bowl":60,"field":50,"keep":0},"form":54,"injuryProne":20,"tier":"budget","country":"IND","teamId":null,"price":0,"injured":false,"injuryGames":0,"fitness":100}];

const ROLE_META = {
  BAT:  { label: 'Batter',       short: 'BAT'  },
  WK:   { label: 'Wicket-Keeper',short: 'WK'   },
  ALL:  { label: 'All-rounder',  short: 'AR'   },
  PACE: { label: 'Pace Bowler',  short: 'PACE' },
  SPIN: { label: 'Spinner',      short: 'SPIN' },
};

const PITCH_LABELS = {
  flat:     'Flat Belter',
  dry:      'Dry Turner',
  green:    'Green Top',
  balanced: 'Balanced',
};

/* 12 Real IPL Grounds — pitch type is editable in Setup */
const DEFAULT_VENUES = [
  { id: 'v01', city: 'Mumbai',      name: 'Wankhede Stadium',                 pitch: 'flat'     },
  { id: 'v02', city: 'Chennai',     name: 'MA Chidambaram Stadium',            pitch: 'dry'      },
  { id: 'v03', city: 'Kolkata',     name: 'Eden Gardens',                      pitch: 'balanced' },
  { id: 'v04', city: 'Bengaluru',   name: 'M. Chinnaswamy Stadium',            pitch: 'flat'     },
  { id: 'v05', city: 'Delhi',       name: 'Arun Jaitley Stadium',              pitch: 'balanced' },
  { id: 'v06', city: 'Hyderabad',   name: 'Rajiv Gandhi Intl Cricket Stadium', pitch: 'flat'     },
  { id: 'v07', city: 'Mohali',      name: 'PCA IS Bindra Stadium',             pitch: 'green'    },
  { id: 'v08', city: 'Jaipur',      name: 'Sawai Mansingh Stadium',            pitch: 'dry'      },
  { id: 'v09', city: 'Ahmedabad',   name: 'Narendra Modi Stadium',             pitch: 'flat'     },
  { id: 'v10', city: 'Dharamsala',  name: 'HPCA Cricket Stadium',              pitch: 'green'    },
  { id: 'v11', city: 'Navi Mumbai', name: 'Dr. DY Patil Sports Academy',       pitch: 'balanced' },
  { id: 'v12', city: 'Pune',        name: 'MCA Stadium, Gahunje',              pitch: 'balanced' },
];

/* 12 Default Teams */
const DEFAULT_TEAMS = [
  { short: 'MUM', name: 'Mumbai Monarchs',     color: '#2563eb', venueId: 'v01', purse: 90 },
  { short: 'CHN', name: 'Chennai Chargers',    color: '#d97706', venueId: 'v02', purse: 90 },
  { short: 'KOL', name: 'Kolkata Knights',     color: '#7c3aed', venueId: 'v03', purse: 90 },
  { short: 'BLR', name: 'Bengaluru Blazers',   color: '#dc2626', venueId: 'v04', purse: 90 },
  { short: 'DEL', name: 'Delhi Dominators',    color: '#0284c7', venueId: 'v05', purse: 90 },
  { short: 'HYD', name: 'Hyderabad Hawks',     color: '#ea580c', venueId: 'v06', purse: 90 },
  { short: 'PBK', name: 'Punjab Panthers',     color: '#be123c', venueId: 'v07', purse: 90 },
  { short: 'RAJ', name: 'Rajasthan Raptors',   color: '#db2777', venueId: 'v08', purse: 90 },
  { short: 'AHM', name: 'Ahmedabad Avengers',  color: '#059669', venueId: 'v09', purse: 90 },
  { short: 'DHA', name: 'Himachal Warriors',   color: '#0891b2', venueId: 'v10', purse: 90 },
  { short: 'NMU', name: 'Navi Mumbai Nexus',   color: '#65a30d', venueId: 'v11', purse: 90 },
  { short: 'PUN', name: 'Pune Pioneers',       color: '#6d28d9', venueId: 'v12', purse: 90 },
];

/* Player name parts */
const FIRST = ['Arjun','Rohan','Vikram','Kabir','Aditya','Ishaan','Dhruv','Veer','Aryan','Nikhil',
               'Sameer','Rahul','Karthik','Manish','Yuvraj','Tejas','Harsh','Ankit','Pranav',
               'Siddharth','Gautam','Varun','Rishabh','Naveen','Akash','Dev','Omar','Imran',
               'Faisal','Jaspreet','Gurpreet','Sandeep','Ravi','Suresh','Deepak','Lakshya',
               'Shaurya','Reyansh','Atharva','Krishna','Madhav','Shivam','Nitin','Rajat',
               'Kunal','Parth','Vivaan','Ishan','Dhruvin','Sachet','Aarav','Priyank'];
const LAST  = ['Sharma','Verma','Patel','Reddy','Nair','Iyer','Menon','Singh','Khan','Kapoor',
               'Malhotra','Chopra','Gill','Sandhu','Pillai','Rao','Bose','Banerjee','Joshi',
               'Desai','Mehta','Shah','Pandey','Mishra','Tiwari','Yadav','Bhat','Naik','Shetty',
               'Hegde','Kaul','Bedi','Sidhu','Dhillon','Ahuja','Sethi','Bajwa','Saxena',
               'Chauhan','Rathore','Solanki','Pawar','Kulkarni','Deshpande','Bhatt','Varma',
               'Trivedi','Chandra','Akhtar','Hussain'];

/* ─────────────────────────────────────────────
   PLAYER GENERATION
   Each player gets:
   - bat/bowl/field/keep ratings (10-99)
   - form (0-100, starts 40-70) — affects in-match performance
   - injuryProne (0-100) — affects P(injury) per round
   - tier: 'star' | 'good' | 'mid' | 'budget'
───────────────────────────────────────────── */
function clampR(v)    { return Math.max(10, Math.min(99, Math.round(v))); }
function randBetween(lo, hi, rnd) { return lo + rnd() * (hi - lo); }

function generateRatings(role, tier, rnd) {
  const base = { star: 82, good: 66, mid: 52, budget: 38 }[tier] || 52;
  const spread = { star: 10, good: 12, mid: 14, budget: 16 }[tier] || 14;
  const R = () => clampR(base + (rnd() - 0.5) * 2 * spread);

  let bat, bowl;
  if (role === 'BAT' || role === 'WK') {
    bat  = R();
    bowl = clampR(randBetween(10, 30, rnd));
  } else if (role === 'PACE' || role === 'SPIN') {
    bowl = R();
    bat  = clampR(randBetween(10, 35, rnd));
  } else { // ALL
    bat  = clampR(base - 5 + (rnd() - 0.5) * spread);
    bowl = clampR(base - 5 + (rnd() - 0.5) * spread);
  }

  return {
    bat,
    bowl,
    field: clampR(randBetween(45, 95, rnd)),
    keep:  role === 'WK' ? clampR(randBetween(68, 98, rnd)) : 0,
  };
}

function playerOverall(p) {
  const r = p.ratings;
  if (p.role === 'BAT')  return Math.round(r.bat * 0.85 + r.field * 0.15);
  if (p.role === 'WK')   return Math.round(r.bat * 0.68 + r.keep * 0.22 + r.field * 0.10);
  if (p.role === 'ALL')  return Math.round((r.bat + r.bowl) / 2 * 0.90 + r.field * 0.10);
  return Math.round(r.bowl * 0.85 + r.field * 0.15);
}

function formLabel(form) {
  if (form >= 75) return { text: '🔥 Hot',     cls: 'form-hot'  };
  if (form >= 55) return { text: '✅ Good',    cls: 'form-good' };
  if (form >= 35) return { text: '😐 Average', cls: 'form-avg'  };
  return            { text: '📉 Cold',    cls: 'form-cold' };
}

function injuryLabel(prone) {
  if (prone >= 70) return { text: 'High',   cls: 'prone-high' };
  if (prone >= 40) return { text: 'Medium', cls: 'prone-med'  };
  return             { text: 'Low',    cls: 'prone-low'  };
}

/* Base price by tier */
const TIER_PRICE = { star: 2.0, good: 1.5, mid: 1.0, budget: 0.5 };

/* Role distribution for pool generation */
const ROLE_DIST = ['BAT','BAT','BAT','WK','WK','ALL','ALL','ALL','PACE','PACE','PACE','SPIN','SPIN'];

function generatePlayerPool(seed, count) {
  const rng  = makeRNG(seed >>> 0);
  const used = new Set();
  const players = [];

  // Determine tier distribution
  const starCount = Math.round(count * 0.18);
  const goodCount = Math.round(count * 0.30);
  const midCount  = Math.round(count * 0.32);
  // rest are budget

  for (let i = 0; i < count; i++) {
    let name, attempts = 0;
    do {
      name = FIRST[Math.floor(rng() * FIRST.length)] + ' ' + LAST[Math.floor(rng() * LAST.length)];
      attempts++;
    } while (used.has(name) && attempts < 80);
    used.add(name);

    const tier = i < starCount ? 'star' : i < starCount + goodCount ? 'good' : i < starCount + goodCount + midCount ? 'mid' : 'budget';
    const role = ROLE_DIST[Math.floor(rng() * ROLE_DIST.length)];
    const ratings = generateRatings(role, tier, rng);

    /* Injury proneness:
       Stars tend to be better conditioned (lower proneness).
       Budget players are often less fit.
    */
    const baseProne  = { star: 22, good: 35, mid: 50, budget: 65 }[tier];
    const proneSpread = 28;
    const injuryProne = clampR(baseProne + (rng() - 0.5) * 2 * proneSpread);

    /* Form: start randomly between 40-70 */
    const form = Math.round(40 + rng() * 30);

    players.push({
      id:          'p_' + i + '_' + (seed >>> 16 & 0xffff).toString(36),
      name,
      role,
      tier,
      ratings,
      form,            // 0-100, performance multiplier
      injuryProne,     // 0-100, injury probability per round
      basePrice:       TIER_PRICE[tier],
      teamId:          null,
      price:           0,
      injured:         false,
      injuryGames:     0,
      fitness:         100,
    });
  }
  return players;
}

/* ─────────────────────────────────────────────
   AUCTION SET BUILDER
   Groups players into named sets by (tier × role)
   so the auction reveals them set by set.
───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   CSV PLAYER IMPORT
   Accepts the IPL_MUN_Players.csv format:
   set,name,role,basePrice,bat,bowl,field,keep,form,injuryProne,tier,country
───────────────────────────────────────────── */
function parsePlayerCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return { ok: false, msg: 'Empty file' };

  // Detect and skip header row
  const first = lines[0].toLowerCase();
  const hasHeader = first.includes('name') || first.includes('role') || first.includes('bat');
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const players = [];
  const errors  = [];

  dataLines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) return;

    // Simple CSV split (handles quoted fields)
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 10) { errors.push('Row ' + (idx + 2) + ': too few columns'); return; }

    const [setStr, name, role, basePriceStr, batStr, bowlStr, fieldStr, keepStr, formStr, injuryProneStr, tier, country] = cols;

    const setNum     = parseInt(setStr, 10)   || 0;
    const basePrice  = parseFloat(basePriceStr) || 0.5;
    const bat        = Math.min(99, Math.max(1, parseInt(batStr, 10)        || 30));
    const bowl       = Math.min(99, Math.max(0, parseInt(bowlStr, 10)       || 10));
    const field      = Math.min(99, Math.max(1, parseInt(fieldStr, 10)      || 60));
    const keep       = Math.min(99, Math.max(0, parseInt(keepStr, 10)       || 0));
    const form       = Math.min(95, Math.max(5,  parseInt(formStr, 10)      || 50));
    const injuryProne= Math.min(99, Math.max(1,  parseInt(injuryProneStr, 10) || 30));
    const validRole  = ['BAT','WK','ALL','PACE','SPIN'].includes(role.toUpperCase()) ? role.toUpperCase() : 'BAT';
    const validTier  = ['star','good','mid','budget'].includes((tier||'').toLowerCase()) ? tier.toLowerCase() : 'mid';

    if (!name) { errors.push('Row ' + (idx + 2) + ': missing name'); return; }

    players.push({
      id:          'csv_' + idx + '_' + Math.random().toString(36).slice(2, 6),
      name:        name,
      role:        validRole,
      tier:        validTier,
      csvSet:      setNum,   // preserved for building named sets
      country:     country || 'IND',
      ratings:     { bat, bowl, field, keep },
      form,
      injuryProne,
      basePrice,
      teamId:      null,
      price:       0,
      injured:     false,
      injuryGames: 0,
      fitness:     100,
    });
  });

  if (!players.length) return { ok: false, msg: 'No valid player rows found. ' + errors.slice(0,3).join('; ') };
  return { ok: true, players, errors };
}

/* Build auction sets from csvSet numbers if available */
function buildAuctionSetsFromCSV(players) {
  // Group by csvSet number, preserving order
  const setMap = {};
  players.forEach(p => {
    const key = p.csvSet || 0;
    if (!setMap[key]) setMap[key] = [];
    setMap[key].push(p.id);
  });

  const SET_NAMES = {
    1:'Premium Batters (Set 1)',       2:'Premium All-Rounders (Set 2)',
    3:'Premium Wicket-Keepers (Set 3)',4:'Premium Pacers (Set 4)',
    5:'Premium Spinners (Set 5)',      6:'Standard Batters (Set 6)',
    7:'Standard All-Rounders (Set 7)', 8:'Standard Wicket-Keepers (Set 8)',
    9:'Standard Pacers (Set 9)',       10:'Standard Spinners (Set 10)',
    11:'Value Batters (Set 11)',       12:'Value All-Rounders (Set 12)',
    13:'Value Wicket-Keepers (Set 13)',14:'Value Pacers (Set 14)',
    15:'Value Spinners (Set 15)',      16:'Budget Batters (Set 16)',
    17:'Budget All-Rounders (Set 17)',18:'Budget Wicket-Keepers (Set 18)',
    19:'Budget Pacers (Set 19)',       20:'Budget Spinners (Set 20)',
  };

  return Object.keys(setMap)
    .map(k => parseInt(k, 10))
    .sort((a, b) => a - b)
    .map(k => ({
      name:      SET_NAMES[k] || 'Set ' + k + ' (Base ₹' + (players.find(p => p.csvSet === k)?.basePrice || '?') + 'Cr)',
      playerIds: setMap[k],
    }));
}

function buildAuctionSets(players) {
  // If players were loaded from CSV (have csvSet field), use named sets
  if (players.length && players[0].csvSet != null) return buildAuctionSetsFromCSV(players);

  const sets = [];

  function addSet(name, pids) {
    if (pids.length > 0) sets.push({ name, playerIds: pids });
  }

  const tiers   = ['star', 'good', 'mid', 'budget'];
  const tierNames = { star: 'Premium', good: 'Standard', mid: 'Value', budget: 'Budget' };
  const roles   = ['BAT', 'WK', 'ALL', 'PACE', 'SPIN'];

  tiers.forEach(tier => {
    roles.forEach(role => {
      const group = players.filter(p => p.tier === tier && p.role === role);
      if (group.length) {
        addSet(
          `${tierNames[tier]} ${ROLE_META[role].label}s (₹${TIER_PRICE[tier]}Cr base)`,
          group.map(p => p.id)
        );
      }
    });
  });

  return sets;
}

/* ─────────────────────────────────────────────
   STATE
───────────────────────────────────────────── */
function freshState() {
  return {
    meta:     { version: APP.version, createdAt: Date.now() },
    phase:    'setup',    // setup | auction | season | playoffs | complete
    config: {
      seasonName:        'IPL MUN Season 2026',
      chairPassword:     'chair',
      squadSize:         15,
      tradeWindowEvery:  3,
    },
    teams:    [],
    players:  [],
    venues:   DEFAULT_VENUES.map(v => ({ ...v })),
    schedule: [],
    results:  {},
    resultOrder: [],
    currentRound: 0,
    auction: {
      sets:            [],   // [{name, playerIds:[]}]
      currentSetIdx:   0,    // which set is open
      currentPlayerId: null, // player being auctioned within set
      sold:            [],   // [{pid, tid, price}]
      unsold:          [],   // [pid]
      phase:           'idle', // idle | inSet | done
    },
    stats: { bat: {}, bowl: {}, field: {}, motm: {} },
    trades:   [],
    playoffs: null,
    codes:    {},
    crisis:   { fired: false, atRound: 0 },
    log:      [],
    h2h:      {},    // head-to-head: h2h['t1_t2'] = {wins:{t1:n,t2:n}}
  };
}

function makeTeamRecord(d) {
  return {
    id:         d.id || ('t_' + d.short),
    name:       d.name,
    short:      d.short,
    color:      d.color,
    venueId:    d.venueId,
    purse:      d.purse  || 90,
    budget:     d.purse  || 90,
    spent:      0,
    squad:      [],
    xi:         [],
    aggression: 55,
    P: 0, W: 0, L: 0, pts: 0, nrr: 0, form: [],
  };
}

/* ─────────────────────────────────────────────
   LIVE STATE
───────────────────────────────────────────── */
let state   = freshState();
let session = { role: null, teamId: null };
let ui      = {
  page:        'setup',
  setupTab:    'teams',
  scOpenId:    null,
  scInn:       '1',
  statTab:     'bat',
  xiTeam:      null,
  loginTab:    'chair',
  awardIdx:    0,
  auctionSet:  0,    // which set is visible in auction UI
  tradeA:      null,
  tradeB:      null,
};

/* ─────────────────────────────────────────────
   PERSISTENCE
───────────────────────────────────────────── */
function save() {
  try { localStorage.setItem(APP.key, JSON.stringify(state)); } catch (_) {}
}

function load() {
  try {
    const raw = localStorage.getItem(APP.key);
    if (!raw) return false;
    state = migrateState(JSON.parse(raw));
    return true;
  } catch (_) { return false; }
}

function migrateState(s) {
  const d = freshState();
  const o = { ...d, ...s };
  o.meta     = { ...d.meta,     ...(s.meta    || {}) };
  o.config   = { ...d.config,   ...(s.config  || {}) };
  o.auction  = { ...d.auction,  ...(s.auction || {}) };
  o.stats    = { bat: {}, bowl: {}, field: {}, motm: {}, ...(s.stats || {}) };
  o.crisis   = { ...d.crisis,   ...(s.crisis  || {}) };
  o.h2h      = s.h2h || {};
  o.venues   = (s.venues && s.venues.length) ? s.venues : d.venues;
  o.teams    = (s.teams  || []).map(t => ({ ...makeTeamRecord(t), ...t }));
  o.players  = (s.players || []).map(p => ({
    form: 50, injuryProne: 40, injured: false, injuryGames: 0, fitness: 100, ...p
  }));
  return o;
}

/* ─────────────────────────────────────────────
   LOOKUPS
───────────────────────────────────────────── */
const teamById    = id  => state.teams.find(t => t.id === id)   || null;
const playerById  = id  => state.players.find(p => p.id === id) || null;
const venueById   = id  => state.venues.find(v => v.id === id)  || null;
const resultById  = id  => state.results[id] || null;
const squadOf     = tid => state.players.filter(p => p.teamId === tid);
const availSquad  = tid => squadOf(tid).filter(p => !p.injured);
const allSquadsOk = ()  => state.teams.every(t => squadOf(t.id).length >= 11);
const standings   = ()  => [...state.teams].sort((a, b) => b.pts - a.pts || b.nrr - a.nrr || b.W - a.W);
const orangeCap   = ()  => {
  let best = null;
  for (const id in state.stats.bat) {
    const s = state.stats.bat[id];
    if (s.runs > 0 && (!best || s.runs > best.runs)) best = { id, ...s };
  }
  return best;
};
const purpleCap = () => {
  let best = null;
  for (const id in state.stats.bowl) {
    const s = state.stats.bowl[id];
    if (s.wkts > 0 && (!best || s.wkts > best.wkts || (s.wkts === best.wkts && s.runs < best.runs))) best = { id, ...s };
  }
  return best;
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

function $(id)         { return document.getElementById(id); }
function ovStr(balls)  { return Math.floor(balls / 6) + '.' + (balls % 6); }
function isChair()     { return session.role === 'chair'; }
function canManage(tid){ return isChair() || (session.role === 'delegate' && session.teamId === tid); }
function genCode()     {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
function logEv(msg) {
  state.log.push({ t: Date.now(), msg });
  if (state.log.length > 300) state.log.shift();
}

function toast(msg, kind = 'info') {
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.textContent = msg;
  document.getElementById('toasts').appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 320); }, 3000);
}

function pip(color, size = 9) {
  return `<span class="pip" style="background:${esc(color)};width:${size}px;height:${size}px"></span>`;
}
function roleBadge(role) {
  return `<span class="rbadge role-${role}">${ROLE_META[role]?.short || role}</span>`;
}
function pitchBadge(p) {
  return `<span class="pbadge pitch-${p}">${PITCH_LABELS[p] || p}</span>`;
}
function formBadge(form) {
  const f = formLabel(form);
  return `<span class="fbadge ${f.cls}">${f.text}</span>`;
}
function aggLabel(v) {
  return v < 25 ? 'Anchor' : v < 45 ? 'Steady' : v < 60 ? 'Balanced' : v < 78 ? 'Attacking' : 'Ultra';
}

/* Squad balance summary */
function squadBalance(teamId) {
  const sq = squadOf(teamId);
  const b = { BAT:0, WK:0, ALL:0, PACE:0, SPIN:0 };
  sq.forEach(p => b[p.role]++);
  return b;
}

/* ─────────────────────────────────────────────
   SEASON LOGIC
───────────────────────────────────────────── */
function initStats() {
  state.stats = { bat: {}, bowl: {}, field: {}, motm: {} };
  state.players.forEach(p => {
    state.stats.bat[p.id]   = { inns:0, runs:0, balls:0, fours:0, sixes:0, hs:0, notOuts:0, outs:0, fifties:0, hundreds:0 };
    state.stats.bowl[p.id]  = { inns:0, balls:0, runs:0, wkts:0, maidens:0, best:'0/0', bestVal:-1, threeW:0 };
    state.stats.field[p.id] = { catches:0, stumpings:0, runOuts:0 };
    state.stats.motm[p.id]  = 0;
  });
}

/* Double round-robin schedule */
function generateSchedule() {
  const ids = state.teams.map(t => t.id);
  const arr = ids.slice();
  if (arr.length % 2) arr.push('__BYE__');
  const n = arr.length, half = n / 2, rounds = [];
  let list = arr.slice();
  for (let r = 0; r < n - 1; r++) {
    const pairs = [];
    for (let i = 0; i < half; i++) {
      const a = list[i], b = list[n - 1 - i];
      if (a !== '__BYE__' && b !== '__BYE__') pairs.push([a, b]);
    }
    rounds.push(pairs);
    const fixed = list[0], rest = list.slice(1); rest.unshift(rest.pop()); list = [fixed, ...rest];
  }

  const schedule = [];
  let rnum = 1;
  const legs = [rounds, rounds.map(r => r.map(([a, b]) => [b, a]))];
  legs.forEach(leg => leg.forEach(pairs => {
    const matches = pairs.map(([hId, aId]) => {
      const home = teamById(hId);
      return {
        id:       `m_${rnum}_${hId}_${aId}`,
        homeId:   hId, awayId: aId,
        venueId:  home ? home.venueId : state.venues[0].id,
        resultId: null,
      };
    });
    schedule.push({ round: rnum, matches });
    rnum++;
  }));

  state.schedule    = schedule;
  state.currentRound = 1;
}

const totalRounds      = () => state.schedule.length;
const roundData        = r  => state.schedule.find(x => x.round === r) || null;
const currentRoundData = () => roundData(state.currentRound);
const roundComplete    = r  => { const rd = roundData(r); return rd ? rd.matches.every(m => m.resultId) : false; };

function applyMatchStats(m) {
  [m.inn1, m.inn2].forEach(inn => {
    inn.batting.forEach(b => {
      if (b.b === 0 && !b.out) return;
      const s = state.stats.bat[b.id]; if (!s) return;
      s.inns++; s.runs += b.r; s.balls += b.b; s.fours += b.fours; s.sixes += b.sixes;
      if (b.r > s.hs) s.hs = b.r;
      if (b.out) s.outs++; else s.notOuts++;
      if (b.r >= 100) s.hundreds++; else if (b.r >= 50) s.fifties++;
    });
    inn.bowling.forEach(b => {
      const s = state.stats.bowl[b.id]; if (!s) return;
      s.inns++; s.balls += b.balls; s.runs += b.runs; s.wkts += b.wkts; s.maidens += b.maidens;
      const v = b.wkts * 100 - b.runs;
      if (v > s.bestVal) { s.bestVal = v; s.best = b.wkts + '/' + b.runs; }
      if (b.wkts >= 3) s.threeW++;
    });
  });
  if (m.motm && state.stats.motm[m.motm] != null) state.stats.motm[m.motm]++;
}

function applyMatchTables(m) {
  const home = teamById(m.homeId), away = teamById(m.awayId);
  if (!home || !away) return;
  home.P++; away.P++;
  const winner = teamById(m.result.winnerId);
  const loser  = winner.id === home.id ? away : home;
  winner.W++; winner.pts += 2; winner.form = [...winner.form, 'W'].slice(-6);
  loser.L++;                   loser.form  = [...loser.form,  'L'].slice(-6);

  // NRR
  const allRes = state.resultOrder.map(id => state.results[id]);
  home.nrr = computeNRR(home.id, allRes);
  away.nrr = computeNRR(away.id, allRes);

  // Head-to-head
  const key = [m.homeId, m.awayId].sort().join('_');
  if (!state.h2h[key]) state.h2h[key] = { wins: {} };
  state.h2h[key].wins[winner.id] = (state.h2h[key].wins[winner.id] || 0) + 1;
}

function playMatch(mr) {
  if (mr.resultId) return resultById(mr.resultId);
  const home  = teamById(mr.homeId);
  const away  = teamById(mr.awayId);
  const venue = venueById(mr.venueId);
  const seed  = hashSeed(mr.id + ':' + state.meta.createdAt);

  const m = simulateMatch({
    home:  buildEngineTeam(home, state.players),
    away:  buildEngineTeam(away, state.players),
    venue: venue || { pitch: 'balanced' },
    seed,
  });

  m.id    = mr.id;
  m.round = state.currentRound;
  m.playedAt = Date.now();

  state.results[m.id] = m;
  state.resultOrder.push(m.id);
  mr.resultId = m.id;

  applyMatchTables(m);
  applyMatchStats(m);
  logEv(`${home.short} v ${away.short}: ${teamById(m.result.winnerId).short} won`);
  return m;
}

function playCurrentRound() {
  const rd = currentRoundData(); if (!rd) return [];
  const played = [];
  rd.matches.forEach(mr => { if (!mr.resultId) played.push(playMatch(mr)); });
  save();
  return played;
}

function advanceRound() {
  if (state.currentRound >= totalRounds()) {
    setupPlayoffs();
    state.phase = 'playoffs';
    save();
    return { done: true };
  }
  state.currentRound++;
  save();
  return { done: false, round: state.currentRound };
}

/* Between-round processing */
function processBetweenRounds(playedMatches) {
  // Update form
  const motmIds = new Set(playedMatches.map(m => m.motm).filter(Boolean));
  updatePlayerForms(state.players, motmIds);

  // Process injuries
  const injLog = processRoundInjuries(state.players, state.currentRound);

  return injLog;
}

/* Crisis: at 75% through league, one star ruled out for rest of season */
function maybeFireCrisis() {
  if (state.crisis.fired) return null;
  if (state.currentRound < Math.ceil(totalRounds() * 0.75)) return null;
  const stars = state.players.filter(p => p.teamId && !p.injured && (p.tier === 'star' || playerOverall(p) >= 75));
  const pool  = stars.length ? stars : state.players.filter(p => p.teamId && !p.injured);
  if (!pool.length) return null;
  const v = pool[Math.floor(Math.random() * pool.length)];
  v.injured = true; v.injuryGames = 999; v.fitness = 0;
  state.crisis = { fired: true, atRound: state.currentRound };
  return v;
}

function tradeWindowOpen() {
  return state.phase === 'season' &&
    state.currentRound > 1 &&
    (state.currentRound - 1) % state.config.tradeWindowEvery === 0;
}

function executeTrade(aTid, aPid, bTid, bPid) {
  const pa = playerById(aPid), pb = playerById(bPid);
  const ta = teamById(aTid),   tb = teamById(bTid);
  if (!pa || !pb || !ta || !tb) return { ok: false, msg: 'Invalid trade' };
  pa.teamId = bTid; pb.teamId = aTid;
  ta.squad  = ta.squad.filter(id => id !== aPid).concat(bPid);
  tb.squad  = tb.squad.filter(id => id !== bPid).concat(aPid);
  ta.xi     = (ta.xi || []).filter(id => id !== aPid);
  tb.xi     = (tb.xi || []).filter(id => id !== bPid);
  state.trades.push({ round: state.currentRound, a: { team: aTid, player: aPid }, b: { team: bTid, player: bPid }, at: Date.now() });
  logEv(`Trade: ${pa.name} (${ta.short}) ↔ ${pb.name} (${tb.short})`);
  save();
  return { ok: true };
}

/* ─────────────────────────────────────────────
   PLAYOFFS
───────────────────────────────────────────── */
function setupPlayoffs() {
  const s = standings();
  if (s.length < 4) return;
  state.playoffs = {
    q1:    { name:'Qualifier 1',  aId:s[0].id, bId:s[1].id, resultId:null, winnerId:null, loserId:null },
    elim:  { name:'Eliminator',   aId:s[2].id, bId:s[3].id, resultId:null, winnerId:null, loserId:null },
    q2:    { name:'Qualifier 2',  aId:null,    bId:null,     resultId:null, winnerId:null, loserId:null },
    final: { name:'Final',        aId:null,    bId:null,     resultId:null, winnerId:null },
    championId: null,
  };
}

function nextPlayoffTie() {
  const po = state.playoffs; if (!po) return null;
  if (!po.q1.resultId)    return 'q1';
  if (!po.elim.resultId)  return 'elim';
  if (!po.q2.resultId)  { po.q2.aId  = po.q1.loserId;   po.q2.bId  = po.elim.winnerId; return 'q2'; }
  if (!po.final.resultId) { po.final.aId = po.q1.winnerId; po.final.bId = po.q2.winnerId;  return 'final'; }
  return null;
}

function playPlayoffTie(key) {
  const po = state.playoffs, tie = po[key];
  if (!tie || tie.resultId) return null;
  const home = teamById(tie.aId), away = teamById(tie.bId);
  if (!home || !away) return null;
  const seed = hashSeed('PO:' + key + ':' + state.meta.createdAt);
  const m = simulateMatch({
    home:  buildEngineTeam(home, state.players),
    away:  buildEngineTeam(away, state.players),
    venue: venueById(state.venues[0].id) || { pitch: 'balanced' },
    seed,
  });
  m.id      = 'po_' + key;
  m.playoff = key;
  m.playedAt = Date.now();
  state.results[m.id] = m;
  state.resultOrder.push(m.id);
  applyMatchStats(m);
  tie.resultId = m.id;
  tie.winnerId = m.result.winnerId;
  tie.loserId  = m.result.winnerId === tie.aId ? tie.bId : tie.aId;
  if (key === 'final') { po.championId = m.result.winnerId; state.phase = 'complete'; }
  save();
  return m;
}

/* ─────────────────────────────────────────────
   AUCTION LOGIC
───────────────────────────────────────────── */
function startAuction() {
  const sets = buildAuctionSets(state.players);
  state.auction = {
    sets,
    currentSetIdx:   0,
    currentPlayerId: null,
    sold:            [],
    unsold:          [],
    phase:           'inSet',
  };
  state.phase = 'auction';
  save();
}

function auctionAssign(playerId, teamId, price) {
  const p = playerById(playerId), t = teamById(teamId);
  if (!p || !t) return { ok: false, msg: 'Invalid player or team' };
  if (price > t.budget) return { ok: false, msg: `${t.short} only has ₹${t.budget.toFixed(1)}Cr remaining` };
  if (squadOf(teamId).length >= state.config.squadSize) return { ok: false, msg: `${t.short} squad is full` };
  p.teamId = teamId;
  p.price  = price;
  t.squad.push(playerId);
  t.spent  += price;
  t.budget -= price;
  state.auction.sold.push({ pid: playerId, tid: teamId, price });
  logEv(`${p.name} → ${t.short} at ₹${price}Cr`);
  save();
  return { ok: true };
}

function auctionMarkUnsold(playerId) {
  state.auction.unsold.push(playerId);
  save();
}

function doFinalizeAuction() {
  // Auto-pick XIs for any team that doesn't have one
  state.teams.forEach(t => {
    if (!t.xi || t.xi.length !== 11) t.xi = autoXI(squadOf(t.id));
  });
  initStats();
  generateSchedule();
  // Assign delegate codes
  state.teams.forEach(t => { if (!state.codes[t.id]) state.codes[t.id] = genCode(); });
  state.phase = 'season';
  save();
}

/* ═══════════════════════════════════════════
   UI RENDER LAYER
   All functions return HTML strings.
   render() rebuilds the page from state.
═══════════════════════════════════════════ */

const NAV = [
  { id:'setup',      label:'Setup',        icon:'⚙'  },
  { id:'auction',    label:'Auction',       icon:'🔨'  },
  { id:'squad',      label:'Squads',        icon:'👥'  },
  { id:'strategy',   label:'Strategy',      icon:'🎯'  },
  { id:'matchday',   label:'Matchday',      icon:'🏏'  },
  { id:'live',       label:'Match Centre',  icon:'📡'  },
  { id:'points',     label:'Points',        icon:'📊'  },
  { id:'scorecards', label:'Scorecards',    icon:'📋'  },
  { id:'stats',      label:'Stats',         icon:'🧮'  },
  { id:'playoffs',   label:'Playoffs',      icon:'🏆'  },
  { id:'admin',      label:'Admin',         icon:'🛡',  chair:true },
  { id:'guide',      label:'Guide',         icon:'❓'  },
];

function render() {
  if (!session.role) { document.getElementById('root').innerHTML = renderLogin(); return; }
  document.getElementById('root').innerHTML = renderShell();
  // Attach slider hooks
  document.querySelectorAll('[data-slider]').forEach(s => {
    const upd = () => {
      const t = teamById(s.dataset.team); if (!t) return;
      t.aggression = +s.value;
      s.style.setProperty('--fill', s.value + '%');
      const dv = document.querySelector(`[data-aggval="${t.id}"]`); if (dv) dv.textContent = s.value;
      const dl = document.querySelector(`[data-agglbl="${t.id}"]`); if (dl) dl.textContent = aggLabel(+s.value);
    };
    s.addEventListener('input', upd);
    s.addEventListener('change', () => save());
    s.style.setProperty('--fill', s.value + '%');
  });
}

/* ── Login ── */
function renderLogin() {
  const tab = ui.loginTab || 'chair';
  return `<div id="screen-login">
  <div class="login-hero">
    <div class="hero-brand">
      <div class="hero-ipl">IPL</div>
      <div class="hero-mun">MUN</div>
      <div class="hero-tagline">Season Simulator</div>
      <div class="hero-cricket">🏏</div>
    </div>
  </div>
  <div class="login-panel">
    <div class="login-card">
      <div class="login-card-head">
        <div class="lc-title">${tab === 'chair' ? 'Chair Login' : 'Delegate Login'}</div>
        <div class="lc-sub">IPL MUN · Season Simulator v5</div>
      </div>
      <div class="seg">
        <button class="${tab === 'chair' ? 'on' : ''}" data-act="loginTab" data-id="chair">🛡 Chair</button>
        <button class="${tab === 'delegate' ? 'on' : ''}" data-act="loginTab" data-id="delegate">👤 Delegate</button>
      </div>
      ${tab === 'chair' ? `
        <div class="field"><label>Chair Password</label>
          <input class="inp" type="password" id="loginPass" placeholder="Default: chair"
            onkeydown="if(event.key==='Enter')document.querySelector('[data-act=doChairLogin]').click()">
        </div>
        <div id="loginErr"></div>
        <button class="btn btn-primary btn-block btn-lg" data-act="doChairLogin">Enter Control Room →</button>
        <div class="login-hint">Chair controls setup, auction, lineups, and simulation. Default password: <code>chair</code></div>
      ` : `
        <div class="field"><label>Team Access Code</label>
          <input class="inp" id="loginCode" placeholder="4-char code" maxlength="4"
            style="text-transform:uppercase;font-family:var(--f-mono);letter-spacing:.22em;font-size:20px;text-align:center"
            onkeydown="if(event.key==='Enter')document.querySelector('[data-act=doDelegateLogin]').click()">
        </div>
        <div id="loginErr"></div>
        <button class="btn btn-primary btn-block btn-lg" data-act="doDelegateLogin">Join as Delegate →</button>
        <div class="login-hint">Enter the 4-character code from your Chair (Admin panel)</div>
      `}
    </div>
  </div>
</div>`;
}

/* ── Shell ── */
function renderShell() {
  const myTeam = session.teamId ? teamById(session.teamId) : null;
  const phLabel = { setup:'Pre-Season', auction:'Auction',
    season:`Round ${state.currentRound}/${totalRounds()}`,
    playoffs:'Playoffs', complete:'Season Complete' }[state.phase] || state.phase;

  return `<div id="app">
  <div class="topbar">
    <div class="mini-brand"><span class="bi">IPL</span><span class="bm">MUN</span></div>
    <div class="season-chip">${esc(state.config.seasonName)}</div>
    <div class="round-chip">${phLabel}</div>
    <div class="topbar-spacer"></div>
    <div class="role-pill">
      ${myTeam ? `<span class="role-pip" style="background:${esc(myTeam.color)}"></span>` : `<span style="font-size:13px">${isChair() ? '🛡' : '👤'}</span>`}
      ${isChair() ? 'Chair' : esc(myTeam ? myTeam.short : 'Delegate')}
    </div>
    <button class="icon-btn" data-act="logout" title="Logout">⤴</button>
  </div>
  <div class="navstrip">
    ${NAV.filter(n => !n.chair || isChair()).map(n => {
      const live = n.id === 'matchday' && state.phase === 'season' && !roundComplete(state.currentRound);
      return `<button class="nav-tab${ui.page === n.id ? ' on' : ''}" data-act="nav" data-id="${n.id}">
        <span class="nav-icon">${n.icon}</span>${n.label}
        ${live ? '<span class="nav-badge">LIVE</span>' : ''}
      </button>`;
    }).join('')}
  </div>
  <div class="appbody">
    ${renderRail()}
    <div class="content">${renderPage()}</div>
  </div>
</div>`;
}

/* ── Standings rail ── */
function renderRail() {
  if (!state.teams.length || state.phase === 'setup') return '';
  const s = standings();
  const o = orangeCap(), p = purpleCap();
  return `<div class="rail">
  <div class="rail-head"><span>Standings</span><span>${state.phase === 'season' ? 'Rd ' + state.currentRound : state.phase}</span></div>
  <div class="rail-list">
    ${s.map((t, i) => `<div class="rail-row${i < 4 ? ' q-zone' : ''}${session.teamId === t.id ? ' is-me' : ''}">
      <span class="rk">${i + 1}</span>
      <span class="pip" style="background:${esc(t.color)}"></span>
      <span class="nm">${esc(t.short)}</span>
      <span class="pt">${t.pts}</span>
      <span class="nr">${t.nrr >= 0 ? '+' : ''}${t.nrr.toFixed(2)}</span>
    </div>`).join('')}
  </div>
  <div class="rail-foot">
    <div class="cap-mini"><span>🟧</span><div>
      <div class="faint" style="font-size:9px;font-family:var(--f-mono);letter-spacing:.12em">ORANGE CAP</div>
      ${o ? esc(playerById(o.id).name.split(' ')[0]) + ' · ' + o.runs + 'r' : '—'}
    </div></div>
    <div class="cap-mini"><span>🟪</span><div>
      <div class="faint" style="font-size:9px;font-family:var(--f-mono);letter-spacing:.12em">PURPLE CAP</div>
      ${p ? esc(playerById(p.id).name.split(' ')[0]) + ' · ' + p.wkts + 'w' : '—'}
    </div></div>
  </div>
</div>`;
}

/* ── Page router ── */
function renderPage() {
  const pages = {
    setup: renderSetup, auction: renderAuction, squad: renderSquad,
    strategy: renderStrategy, matchday: renderMatchday, live: renderLive,
    points: renderPoints, scorecards: renderScorecards, stats: renderStats,
    playoffs: renderPlayoffs, admin: renderAdmin, guide: renderGuide,
  };
  try { return (pages[ui.page] || renderSetup)(); }
  catch (e) { return `<div class="empty-state" style="padding:80px">Error: ${esc(String(e))}</div>`; }
}

function locked() { return `<div class="empty-state" style="padding:80px">🔒 Chair access only.</div>`; }

function phd(eye, title, sub = '') {
  return `<div class="page-head">
    <div class="page-eyebrow">${esc(eye)}</div>
    <h1 class="page-title">${esc(title)}</h1>
    ${sub ? `<div class="page-sub">${esc(sub)}</div>` : ''}
  </div>`;
}

function stepper(active) {
  const steps = [['Setup','setup'],['Auction','auction'],['Strategy','strategy'],['Season','matchday'],['Playoffs','playoffs']];
  const ai = steps.findIndex(([,k]) => k === active);
  return `<div class="stepper">
    ${steps.map(([l], i) => `<div class="step${i < ai ? ' done' : i === ai ? ' on' : ''}">
      <span class="sn">${i < ai ? '✓' : i + 1}</span>${l}
    </div>`).join('')}
  </div>`;
}

/* ── SETUP ── */
function renderSetup() {
  if (!isChair()) return locked();
  const t    = ui.setupTab || 'teams';
  const ready = state.teams.length >= 2 && state.players.length >= 11;

  return `${stepper('setup')}
${phd('Step 1', 'League Setup', 'Configure your 12 teams, set individual budgets and home grounds, then generate the player pool.')}

${state.phase !== 'setup' ? `<div class="panel"><div class="panel-body" style="display:flex;align-items:center;gap:14px">
  <span style="font-size:20px">✅</span>
  <div class="grow"><b>Setup complete.</b> <span class="dim">Season is underway.</span></div>
  <button class="btn btn-primary btn-sm" data-act="nav" data-id="${state.phase === 'auction' ? 'auction' : 'matchday'}">${state.phase === 'auction' ? 'Go to Auction' : 'Go to Matchday'} →</button>
</div></div>` : `
<div class="panel">
  <div class="panel-body">
    <div style="display:flex;align-items:center;gap:14px;padding-bottom:20px;border-bottom:1px solid var(--line);margin-bottom:20px">
      <button class="btn btn-primary btn-lg" data-act="quickStart">⚡ Quick Start — 12 Teams</button>
      <span class="dim">12 teams · 156 players · All real IPL grounds · Budgets set at ₹90Cr each. One click, fully configured.</span>
    </div>
    <div class="seg" style="max-width:520px;margin-bottom:20px">
      <button class="${t === 'teams' ? 'on' : ''}" data-act="setupTab" data-id="teams">🏟 Teams & Grounds</button>
      <button class="${t === 'venues' ? 'on' : ''}" data-act="setupTab" data-id="venues">📍 Pitch Types</button>
      <button class="${t === 'players' ? 'on' : ''}" data-act="setupTab" data-id="players">👤 Players</button>
      <button class="${t === 'config' ? 'on' : ''}" data-act="setupTab" data-id="config">⚙ Rules</button>
    </div>
    ${t === 'teams' ? renderSetupTeams() : t === 'venues' ? renderSetupVenues() : t === 'players' ? renderSetupPlayers() : renderSetupConfig()}
  </div>
</div>
<div style="display:flex;justify-content:flex-end;align-items:center;gap:14px;margin-bottom:24px">
  <span class="dim">${state.teams.length} teams · ${state.players.length} players</span>
  <button class="btn btn-primary btn-lg" data-act="beginAuction" ${ready ? '' : 'disabled'}>Lock In & Begin Auction →</button>
</div>`}`;
}

function renderSetupTeams() {
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
  <b>Teams <span class="dim">(${state.teams.length})</span></b>
  <div style="display:flex;gap:8px">
    <button class="btn btn-ghost btn-sm" data-act="loadDefaultTeams">Load 12 Defaults</button>
    <button class="btn btn-ghost btn-sm" data-act="addTeam">+ Add Team</button>
  </div>
</div>
<div class="team-header-row">
  <span></span><span>TEAM NAME</span><span>CODE</span><span>PURSE ₹Cr</span><span>HOME GROUND</span><span>COLOR</span><span></span>
</div>
${state.teams.length ? state.teams.map(t => `
<div class="team-row">
  <span class="pip" style="background:${esc(t.color)};width:13px;height:13px;border-radius:4px"></span>
  <input class="inp" value="${esc(t.name)}" data-act="editTeam" data-field="name" data-id="${t.id}" placeholder="Team name">
  <input class="inp" value="${esc(t.short)}" data-act="editTeam" data-field="short" data-id="${t.id}" maxlength="4" style="text-transform:uppercase;font-family:var(--f-mono);text-align:center;max-width:70px">
  <input class="inp" type="number" value="${t.purse || 90}" data-act="editTeam" data-field="purse" data-id="${t.id}" min="10" max="500" style="font-family:var(--f-mono);max-width:80px">
  <select class="inp" data-act="editTeam" data-field="venueId" data-id="${t.id}" style="font-size:12px">
    ${state.venues.map(v => `<option value="${v.id}"${t.venueId === v.id ? ' selected' : ''}>${esc(v.city)} — ${esc(v.name)}</option>`).join('')}
  </select>
  <input type="color" class="swatch" value="${esc(t.color)}" data-act="editTeam" data-field="color" data-id="${t.id}">
  <button class="icon-btn" data-act="removeTeam" data-id="${t.id}" style="font-size:11px">✕</button>
</div>`).join('') : `<div class="empty-state">No teams yet. Load the 12 defaults or add custom teams.</div>`}`;
}

function renderSetupVenues() {
  return `<div style="margin-bottom:14px">
  <b>Ground Pitch Types</b>
  <div class="dim" style="font-size:12px;margin-top:4px">Set the pitch type for each ground. This affects scoring patterns — a green top boosts pace, a dry turner helps spinners, a flat belter is a batting paradise.</div>
</div>
${state.venues.map(v => `
<div style="display:grid;grid-template-columns:1fr 200px;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--line)">
  <div>
    <b>${esc(v.name)}</b>
    <div class="faint" style="font-size:11px">📍 ${esc(v.city)}</div>
  </div>
  <select class="inp" data-act="editVenuePitch" data-id="${v.id}" style="font-size:12px">
    ${['flat','dry','green','balanced'].map(pt =>
      `<option value="${pt}"${v.pitch === pt ? ' selected' : ''}>${PITCH_LABELS[pt]}</option>`
    ).join('')}
  </select>
</div>`).join('')}`;
}

function renderSetupPlayers() {
  const rc = {}; state.players.forEach(p => rc[p.role] = (rc[p.role] || 0) + 1);
  const tc = {}; state.players.forEach(p => tc[p.tier] = (tc[p.tier] || 0) + 1);
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
  <b>Player Pool <span class="dim">(${state.players.length})</span></b>
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <button class="btn btn-primary btn-sm" data-act="triggerCSVImport">Import CSV</button>
    <input type="file" id="csvPlayerFile" accept=".csv,text/csv" class="hidden">
    <button class="btn btn-ghost btn-sm" data-act="genPool" data-id="120">120 Random</button>
    <button class="btn btn-ghost btn-sm" data-act="genPool" data-id="156">156 Random</button>
    ${state.players.length ? `<button class="btn btn-outline btn-sm" data-act="clearPool">Clear</button>` : ''}
  </div>
</div>
<div class="hint" style="margin-bottom:14px">
  Real IPL player pool (326 players) is already built in. Use CSV import to load a custom roster instead.
</div>
${state.players.length ? `
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
  ${Object.keys(ROLE_META).map(r => `<span class="rbadge role-${r}" style="font-size:11px;padding:4px 10px">${ROLE_META[r].label}: ${rc[r] || 0}</span>`).join('')}
</div>
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
  <span class="rbadge" style="background:rgba(245,200,66,.14);color:var(--gold)">Stars: ${tc.star || 0}</span>
  <span class="rbadge" style="background:rgba(56,189,248,.12);color:#38bdf8">Good: ${tc.good || 0}</span>
  <span class="rbadge" style="background:rgba(139,146,168,.12);color:var(--ink-dim)">Mid: ${tc.mid || 0}</span>
  <span class="rbadge" style="background:rgba(239,68,68,.1);color:var(--red)">Budget: ${tc.budget || 0}</span>
</div>
<div class="hint">Players carry <b>Form</b> (performance multiplier) and <b>Injury Proneness</b> ratings.</div>
` : `<div class="empty-state">No players yet. Import a CSV or generate a random pool.</div>`}`;
}


function renderSetupConfig() {
  const c = state.config;
  return `<div class="form-grid">
  <div class="field"><label>Season Name</label><input class="inp" value="${esc(c.seasonName)}" data-act="editConfig" data-field="seasonName"></div>
  <div class="field"><label>Max Squad Size</label><input class="inp" type="number" value="${c.squadSize}" data-act="editConfig" data-field="squadSize" min="11" max="25"></div>
  <div class="field"><label>Trade Window Every (rounds)</label><input class="inp" type="number" value="${c.tradeWindowEvery}" data-act="editConfig" data-field="tradeWindowEvery" min="1" max="20"></div>
  <div class="field"><label>Chair Password</label><input class="inp" value="${esc(c.chairPassword)}" data-act="editConfig" data-field="chairPassword"></div>
</div>
<div class="hint">12 teams → 22-round double round-robin (132 matches), then top-4 playoffs. Each team's individual budget is set in the Teams tab.</div>`;
}

/* ── AUCTION — set-by-set ── */
function renderAuction() {
  if (state.phase === 'setup') return `<div class="empty-state" style="padding:80px">Complete setup first, then begin the auction.</div>`;

  const a = state.auction;
  const currentSet = a.sets[ui.auctionSet];
  const isFinal = allSquadsOk();

  return `${stepper('auction')}
${phd('Step 2', 'Player Auction', 'Players are revealed set by set. For each player, announce bids and enter the winning team and price.')}

<div class="auction-layout">
  <!-- Left: Set list -->
  <div class="auction-sets-panel">
    <div class="auction-sets-header">Sets (${a.sets.length})</div>
    <div class="auction-sets-list">
      ${a.sets.map((s, i) => {
        const soldInSet  = s.playerIds.filter(id => a.sold.find(x => x.pid === id)).length;
        const totalInSet = s.playerIds.length;
        const complete   = soldInSet + s.playerIds.filter(id => a.unsold.includes(id)).length === totalInSet;
        return `<button class="set-btn${ui.auctionSet === i ? ' on' : ''}${complete ? ' done' : ''}" data-act="selectAuctionSet" data-id="${i}">
          <span class="set-name">${esc(s.name)}</span>
          <span class="set-count">${soldInSet}/${totalInSet}</span>
        </button>`;
      }).join('')}
    </div>
    ${isChair() ? `<div style="padding:12px;border-top:1px solid var(--line)">
      <button class="btn btn-primary btn-block" data-act="finalizeAuction"${isFinal ? '' : ' disabled'}>
        Finalize & Start Season →
      </button>
      ${isFinal ? '' : `<div class="hint" style="margin-top:6px">Every team needs 11+ players.</div>`}
    </div>` : ''}
  </div>

  <!-- Middle: Current set players -->
  <div class="auction-main">
    ${currentSet ? `
    <div class="panel">
      <div class="panel-head">
        <div class="panel-title">📦 ${esc(currentSet.name)}</div>
        <span class="dim">${currentSet.playerIds.filter(id => a.sold.find(x => x.pid === id)).length} sold · ${currentSet.playerIds.filter(id => a.unsold.includes(id)).length} unsold · ${currentSet.playerIds.filter(id => !a.sold.find(x => x.pid === id) && !a.unsold.includes(id)).length} available</span>
      </div>
      <div class="panel-body">
        <div class="auction-player-grid">
          ${currentSet.playerIds.map(pid => {
            const p   = playerById(pid);
            const sold = a.sold.find(x => x.pid === pid);
            const unsold = a.unsold.includes(pid);
            const soldTeam = sold ? teamById(sold.tid) : null;
            const fl = formLabel(p.form);
            const ip = injuryLabel(p.injuryProne);
            return `<div class="auction-pcard${sold ? ' sold' : unsold ? ' unsold' : ''}" ${!sold && !unsold && isChair() ? `data-act="openAuctionPlayer" data-id="${pid}"` : ''}>
              <div class="apc-top">
                <div style="min-width:0">
                  <div class="apc-name">${esc(p.name)}</div>
                  <div style="display:flex;gap:5px;margin-top:4px;flex-wrap:wrap">
                    ${roleBadge(p.role)}
                    <span class="fbadge ${fl.cls}" style="font-size:9px;padding:2px 6px">${fl.text}</span>
                  </div>
                </div>
                <div class="apc-ovr">${playerOverall(p)}</div>
              </div>
              <div style="display:flex;gap:8px;font-size:10px;font-family:var(--f-mono);margin-top:6px">
                <span>BAT <b>${p.ratings.bat}</b></span>
                <span>BWL <b>${p.ratings.bowl}</b></span>
                <span class="prone-badge ${ip.cls}">INJ:${ip.text}</span>
              </div>
              <div class="apc-price">₹${p.basePrice}Cr base</div>
              ${sold ? `<div class="apc-sold-banner" style="background:${esc(soldTeam?.color || '#22c55e')}88">
                <span class="pip" style="background:${esc(soldTeam?.color)}"></span>
                ${esc(soldTeam?.short)} — ₹${sold.price}Cr
              </div>` : unsold ? `<div class="apc-sold-banner" style="background:rgba(239,68,68,.3)">UNSOLD</div>` : ''}
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>
    ` : `<div class="empty-state" style="padding:60px">Select a set from the left panel to begin auctioning.</div>`}
  </div>

  <!-- Right: Budgets -->
  <div class="auction-budgets-panel">
    <div class="panel">
      <div class="panel-head"><div class="panel-title">💰 Budgets</div></div>
      <div class="panel-body">
        ${state.teams.map(t => {
          const pct = Math.max(0, t.budget) / Math.max(1, t.purse) * 100;
          const cls = pct < 20 ? 'crit' : pct < 40 ? 'low' : '';
          const sq  = squadOf(t.id).length;
          return `<div class="budget-row">
            <div class="grow">
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
                <span>${pip(t.color)} <b>${esc(t.short)}</b></span>
                <span style="font-family:var(--f-mono);color:var(--ink-dim)">₹${t.budget.toFixed(1)}/${t.purse}Cr · ${sq}p</span>
              </div>
              <div class="budget-bar"><div class="budget-fill ${cls}" style="width:${pct}%"></div></div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
    <div class="panel">
      <div class="panel-head"><div class="panel-title">📜 Recent Sales</div></div>
      <div class="panel-body">
        <div style="max-height:260px;overflow-y:auto">
          ${[...a.sold].reverse().slice(0, 20).map(s => {
            const p = playerById(s.pid), t = teamById(s.tid);
            return `<div class="log-entry">${roleBadge(p.role)}<span style="flex:1;font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.name)}</span>
              ${pip(t.color)}<span style="font-size:11px;color:var(--ink-dim)">${esc(t.short)}</span>
              <span style="font-family:var(--f-mono);color:var(--gold);font-size:11px">₹${s.price}Cr</span>
            </div>`;
          }).join('') || '<div class="empty-state">No sales yet.</div>'}
        </div>
      </div>
    </div>
  </div>
</div>`;
}

/* ── SQUAD ── */
function renderSquad() {
  if (state.phase === 'setup') return `<div class="empty-state" style="padding:80px">Squads appear after the auction.</div>`;
  const tid  = ui.xiTeam || (session.teamId || state.teams[0]?.id);
  const team = teamById(tid);
  if (!team) return `<div class="empty-state">No teams found.</div>`;

  const squad  = squadOf(tid).sort((a, b) => playerOverall(b) - playerOverall(a));
  const xiSet  = new Set(team.xi?.length === 11 ? team.xi : autoXI(squad));
  const canEdit = canManage(tid);
  const bal    = squadBalance(tid);

  return `${phd('Rosters', 'Squads & Playing XI', canEdit ? 'Tap a player to add or remove from the XI. Players in form show 🔥.' : 'View-only.')}
<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px">
  ${state.teams.map(t => `<button class="fpill${tid === t.id ? ' on' : ''}" data-act="selectSquad" data-id="${t.id}">
    ${pip(t.color)} ${esc(t.short)}
  </button>`).join('')}
</div>
<div class="panel">
  <div class="panel-head">
    <div class="panel-title">${pip(team.color, 11)} ${esc(team.name)}</div>
    <div style="display:flex;align-items:center;gap:10px">
      <div style="display:flex;gap:5px;font-size:11px;font-family:var(--f-mono);color:var(--ink-dim)">
        ${Object.entries(bal).map(([r, n]) => `<span>${ROLE_META[r].short}:${n}</span>`).join(' ')}
      </div>
      <span class="xi-counter${xiSet.size === 11 ? ' full' : ''}">XI: ${[...xiSet].filter(id => squad.some(p => p.id === id)).length}/11</span>
      ${canEdit ? `<button class="btn btn-ghost btn-sm" data-act="autoXI" data-id="${tid}">Auto XI</button>` : ''}
    </div>
  </div>
  <div class="panel-body">
    <div class="squad-grid">
      ${squad.map(p => {
        const sel = xiSet.has(p.id);
        const fl  = formLabel(p.form);
        const ip  = injuryLabel(p.injuryProne);
        return `<div class="pcard${sel ? ' sel' : ''}${p.injured ? ' inj' : ''}"
          ${canEdit && !p.injured ? `data-act="toggleXI" data-id="${p.id}" data-team="${tid}"` : ''}>
          <div class="pcard-top">
            <div style="min-width:0">
              <div class="pcard-name">${esc(p.name)}</div>
              <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">
                ${roleBadge(p.role)}
                ${p.injured ? '<span class="rbadge" style="background:rgba(239,68,68,.14);color:var(--red)">🚑 OUT</span>' : ''}
                ${sel ? '<span class="rbadge" style="background:rgba(34,197,94,.14);color:var(--green)">XI</span>' : ''}
              </div>
            </div>
            <div class="pcard-ovr">${playerOverall(p)}</div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
            ${formBadge(p.form)}
            <span class="prone-badge ${ip.cls}" style="font-size:9px;padding:2px 6px">INJ:${ip.text}</span>
          </div>
          <div class="rating-line" style="margin-top:6px">
            <span class="rating-chip">BAT <b>${p.ratings.bat}</b></span>
            <span class="rating-chip">BWL <b>${p.ratings.bowl}</b></span>
            <span class="rating-chip">FLD <b>${p.ratings.field}</b></span>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>
</div>`;
}

/* ── STRATEGY ── */
function renderStrategy() {
  if (state.phase === 'setup' || !state.teams.length) return `<div class="empty-state" style="padding:80px">Strategy unlocks after the auction.</div>`;
  const teams = isChair() ? state.teams : state.teams.filter(t => t.id === session.teamId);
  return `${stepper('strategy')}
${phd('Step 3', 'Team Strategy', 'Set batting aggression per team. Higher aggression = more boundaries but more wicket risk. Pitch type affects scoring at each ground.')}
<div class="grid grid-2" style="gap:14px">
  ${teams.map(t => {
    const v    = venueById(t.venueId);
    const xiOk = t.xi?.length === 11;
    return `<div class="strat-card">
      <div class="strat-head">
        <span class="pip" style="background:${esc(t.color)};width:14px;height:36px;border-radius:5px;flex-shrink:0"></span>
        <div style="flex:1;min-width:0">
          <div class="strat-name">${esc(t.name)}</div>
          ${v ? `<div style="font-size:10px;color:var(--ink-dim);font-family:var(--f-mono)">${esc(v.city)} · ${pitchBadge(v.pitch)}</div>` : ''}
        </div>
        <span class="xi-mini ${xiOk ? 'ok' : 'no'}">${xiOk ? 'XI ✓' : 'Auto XI'}</span>
      </div>
      <div class="agg-readout">
        <div><span class="agg-val" data-aggval="${t.id}">${t.aggression}</span><span style="color:var(--ink-dim);font-size:14px"> / 100</span></div>
        <div class="agg-label" data-agglbl="${t.id}">${aggLabel(t.aggression)}</div>
      </div>
      ${canManage(t.id) ? `<input type="range" class="slider" min="0" max="100" value="${t.aggression}" data-slider data-team="${t.id}" style="margin:10px 0">` :
        `<div style="height:5px;background:rgba(255,255,255,.08);border-radius:3px;margin:12px 0"><div style="height:100%;width:${t.aggression}%;background:var(--gold);border-radius:3px"></div></div>`}
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:8px">
        <span class="etag up">▲ Boundaries</span>
        ${t.aggression > 60 ? '<span class="etag down">▲ Wicket risk</span>' : '<span class="etag up">▼ Wicket risk</span>'}
        <span class="etag ${t.aggression > 55 ? 'up' : 'down'}">${t.aggression > 55 ? '▲' : '▼'} Run rate</span>
      </div>
    </div>`;
  }).join('')}
</div>
${isChair() ? `<div style="display:flex;justify-content:flex-end;margin-top:20px">
  <button class="btn btn-primary btn-lg" data-act="nav" data-id="matchday">To Matchday →</button>
</div>` : ''}`;
}

/* ── MATCHDAY ── */
function renderMatchday() {
  if (['setup','auction'].includes(state.phase)) return `<div class="empty-state" style="padding:80px">Matchday unlocks once the season starts.</div>`;
  if (['playoffs','complete'].includes(state.phase)) return `<div class="panel"><div class="panel-body" style="display:flex;align-items:center;gap:14px">
    <span style="font-size:22px">🏆</span>
    <div class="grow"><b>League stage complete.</b> <span class="dim">Head to Playoffs.</span></div>
    <button class="btn btn-primary btn-sm" data-act="nav" data-id="playoffs">Go to Playoffs →</button>
  </div></div>`;

  const rd   = currentRoundData();
  const done = roundComplete(state.currentRound);
  const tw   = tradeWindowOpen();

  return `${stepper('matchday')}
${phd('Step 4', `Matchday — Round ${state.currentRound}`, 'Simulate the round. Injuries and form updates happen automatically between rounds.')}

${tw && isChair() ? `<div class="panel" style="border-color:rgba(245,158,11,.28)"><div class="panel-body" style="display:flex;align-items:center;gap:12px">
  <span style="font-size:18px">🔄</span>
  <div class="grow"><b>Trade window open</b> <span class="dim">— swap players before this round.</span></div>
  <button class="btn btn-ghost btn-sm" data-act="nav" data-id="admin">Trade Desk →</button>
</div></div>` : ''}

<div class="panel">
  <div class="panel-head">
    <div class="panel-title">🏟 Round ${state.currentRound} Fixtures</div>
    <span class="dim">${rd.matches.filter(m => m.resultId).length}/${rd.matches.length} played</span>
  </div>
  <div class="panel-body">
    ${rd.matches.map(m => {
      const h = teamById(m.homeId), a = teamById(m.awayId), v = venueById(m.venueId);
      const res = m.resultId ? resultById(m.resultId) : null;
      const w   = res ? teamById(res.result.winnerId) : null;
      return `<div class="fixture-row">
        <div class="fixture-home">${esc(h.name)} ${pip(h.color)}</div>
        <div class="fixture-mid">
          ${res ? `<div style="font-family:var(--f-mono);font-size:12px;color:var(--gold)">${esc(w.short)} won</div>
            <div style="font-size:10px;color:var(--ink-off)">by ${res.result.margin} ${res.result.method}</div>`
          : `<div style="font-weight:700;color:var(--ink-off)">vs</div>
            ${v ? `<div style="font-size:10px;color:var(--ink-off)">${esc(v.city)} · ${pitchBadge(v.pitch)}</div>` : ''}`}
        </div>
        <div class="fixture-away">${pip(a.color)} ${esc(a.name)}</div>
      </div>`;
    }).join('')}
  </div>
</div>

${isChair() ? `<div class="panel"><div class="panel-body" style="text-align:center;padding:28px">
  ${!done ? `
  <button class="btn btn-live btn-lg" data-act="simRound">▶ Simulate Round ${state.currentRound}</button>
  <div class="hint" style="margin-top:10px">All ${rd.matches.length} matches will play out. Form and injuries update automatically between rounds.</div>
  ` : `
  <div style="font-size:44px;margin-bottom:10px">✅</div>
  <div style="font-family:var(--f-display);font-size:26px">Round ${state.currentRound} Complete</div>
  <div style="display:flex;justify-content:center;gap:12px;margin-top:18px">
    <button class="btn btn-ghost" data-act="nav" data-id="live">View Match Centre</button>
    <button class="btn btn-primary btn-lg" data-act="advanceRound">
      ${state.currentRound >= totalRounds() ? 'Setup Playoffs →' : 'Next Round →'}
    </button>
  </div>`}
</div></div>` : `<div class="panel"><div class="panel-body" style="text-align:center;padding:20px;color:var(--ink-dim)">
  ${done ? 'Round complete — waiting for Chair to advance.' : 'Waiting for the Chair to simulate this round.'}
</div></div>`}`;
}

/* ── MATCH CENTRE ── */
function renderLive() {
  const played = state.resultOrder.map(id => state.results[id]).filter(Boolean);
  if (!played.length) return `<div style="text-align:center;padding:80px 20px;color:var(--ink-off)">
    <div style="font-size:60px;opacity:.18;margin-bottom:14px">📡</div>
    <div style="font-family:var(--f-display);font-size:26px;color:var(--ink-dim)">No matches played yet</div>
  </div>`;
  const rd   = currentRoundData();
  const show = (rd?.matches.filter(m => m.resultId).map(m => resultById(m.resultId)) || []).filter(Boolean);
  const display = show.length ? show : played.slice(-6);

  return `${phd('Broadcast', 'Match Centre', 'Most recent round results. Click any card for the full scorecard.')}
<div class="live-grid">
  ${display.map((m, i) => matchCard(m, i === 0)).join('')}
</div>`;
}

function matchCard(m, feat = false) {
  if (!m) return '';
  const h   = teamById(m.homeId), a = teamById(m.awayId), v = venueById(m.venueId);
  const w   = teamById(m.result.winnerId);
  const motm = m.motm ? playerById(m.motm) : null;

  function innBlock(inn, team) {
    const top   = [...inn.batting].sort((x, y) => y.r - x.r)[0];
    const won   = team.id === w.id;
    const topBwl = [...inn.bowling].sort((x,y)=>y.wkts-x.wkts||x.runs-y.runs)[0];
    return `<div class="mc-inn">
      <div class="mc-team-left">
        <span class="mc-bar" style="background:${esc(team.color)};${won ? 'box-shadow:0 0 12px ' + esc(team.color) + '55' : 'opacity:.4'}"></span>
        <div>
          <div class="mc-team-name" style="${won ? 'color:' + esc(team.color) : ''}">${esc(team.short)}</div>
          ${top && top.r > 0 ? `<div class="mc-top-bat">${esc(top.name.split(' ').pop())} ${top.r}(${top.b})</div>` : ''}
        </div>
      </div>
      <div class="mc-score-block">
        <div class="mc-score" style="${won ? 'color:' + esc(team.color) : ''}">${inn.runs}<span style="font-size:20px;opacity:.6">/${inn.wickets}</span></div>
        <div class="mc-overs">${inn.overs} ov${topBwl && topBwl.wkts > 0 ? ' · ' + esc(topBwl.name.split(' ').pop()) + ' ' + topBwl.wkts + '/' + topBwl.runs : ''}</div>
      </div>
    </div>
    <div class="phasebar">
      <div class="phaseseg ph-powerplay"><div class="pl">PP</div><div class="pv">${inn.phases.powerplay.r}/${inn.phases.powerplay.w}</div></div>
      <div class="phaseseg ph-middle" style="flex:2"><div class="pl">MID</div><div class="pv">${inn.phases.middle.r}/${inn.phases.middle.w}</div></div>
      <div class="phaseseg ph-death"><div class="pl">DEATH</div><div class="pv">${inn.phases.death.r}/${inn.phases.death.w}</div></div>
    </div>`;
  }

  const t1 = teamById(m.inn1.teamId), t2 = teamById(m.inn2.teamId);
  return `<div class="match-card${feat ? ' feat' : ''}" data-act="openScorecard" data-id="${m.id}">
  <div class="mc-header">
    <div class="mc-header-h" style="background:${esc(t1.color)}"></div>
    <div class="mc-header-a" style="background:${esc(t2.color)}"></div>
  </div>
  <div class="mc-meta">
    <span class="mc-venue-txt">📍 ${esc(v ? v.name : '')} ${v ? '· ' + pitchBadge(v.pitch) : ''}</span>
    <span class="faint" style="font-size:10px;font-family:var(--f-mono)">FULL TIME</span>
  </div>
  <div class="mc-body">
    ${innBlock(m.inn1, t1)}
    <div style="height:1px;background:var(--line);margin:8px 0"></div>
    ${innBlock(m.inn2, t2)}
  </div>
  <div class="mc-result">
    🏆 <b>${esc(w.name)}</b> won ${m.result.super ? '(Super Over)' : `by ${m.result.margin} ${m.result.method}`}
    <span style="font-family:var(--f-ui);font-weight:600;font-size:11px;color:var(--ink-dim)">${motm ? ' · MOTM: ' + esc(motm.name) : ''}</span>
  </div>
</div>`;
}

/* ── POINTS TABLE ── */
function renderPoints() {
  if (!state.teams.length || state.phase === 'setup') return `<div class="empty-state" style="padding:80px">Points table fills in once the season starts.</div>`;
  const s = standings();
  return `${phd('Standings', 'Points Table', 'Top 4 teams qualify for the playoffs.')}
<div class="panel"><div class="panel-body flush">
  <table class="tbl">
    <thead><tr><th>#</th><th class="l">Team</th><th>P</th><th>W</th><th>L</th><th>Pts</th><th>NRR</th><th>Form</th></tr></thead>
    <tbody>
      ${s.map((t, i) => `<tr class="${i < 4 ? 'qz' : ''}${i === s.length - 1 ? ' dz' : ''}${session.teamId === t.id ? ' mez' : ''}">
        <td><span class="spos" style="${i < 4 ? 'background:rgba(34,197,94,.18);color:var(--green)' : ''}">${i + 1}</span></td>
        <td class="l"><div style="display:flex;align-items:center;gap:9px">${pip(t.color)}<span style="font-weight:700">${esc(t.name)}</span></div></td>
        <td class="num">${t.P}</td><td class="num">${t.W}</td><td class="num">${t.L}</td>
        <td class="num" style="color:var(--gold);font-weight:800">${t.pts}</td>
        <td class="num ${t.nrr > 0 ? 'nrr-pos' : t.nrr < 0 ? 'nrr-neg' : ''}">${t.nrr >= 0 ? '+' : ''}${t.nrr.toFixed(3)}</td>
        <td><div style="display:inline-flex;gap:3px">${(t.form.length ? t.form : ['·']).map(f =>
          `<span style="width:17px;height:17px;border-radius:5px;font-size:9px;font-weight:700;display:grid;place-items:center;${f === 'W' ? 'background:rgba(34,197,94,.2);color:var(--green)' : f === 'L' ? 'background:rgba(239,68,68,.15);color:var(--red)' : 'color:var(--ink-off)'}">${f}</span>`
        ).join('')}</div></td>
      </tr>`).join('')}
    </tbody>
  </table>
</div></div>
<div style="display:flex;gap:16px;flex-wrap:wrap;margin:10px 2px 0;font-size:11px;color:var(--ink-off)">
  <span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:rgba(34,197,94,.3);margin-right:5px"></span>Playoff spots (top 4)</span>
  <span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:var(--cyan);margin-right:5px"></span>Your team</span>
</div>`;
}

/* ── SCORECARDS ── */
function renderScorecards() {
  const played = state.resultOrder.map(id => state.results[id]).filter(Boolean);
  if (!played.length) return `<div class="empty-state" style="padding:80px">No scorecards yet.</div>`;
  if (!ui.scOpenId || !state.results[ui.scOpenId]) ui.scOpenId = played[played.length - 1].id;
  const m = state.results[ui.scOpenId];
  return `${phd('Scorecards', 'Full Scorecards', 'Batting & bowling cards, FOW, and Player of the Match.')}
<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">
  ${played.slice().reverse().map(r => {
    const h = teamById(r.homeId), a = teamById(r.awayId);
    const lbl = r.playoff ? r.playoff.toUpperCase() : 'R' + r.round;
    return `<button class="sc-tab${ui.scOpenId === r.id ? ' on' : ''}" data-act="openScorecard" data-id="${r.id}">${lbl}: ${esc(h.short)} v ${esc(a.short)}</button>`;
  }).join('')}
</div>
${scorecardDetail(m)}`;
}

function scorecardDetail(m) {
  const h = teamById(m.homeId), a = teamById(m.awayId), v = venueById(m.venueId), w = teamById(m.result.winnerId);
  const motm = m.motm ? playerById(m.motm) : null;
  const tw   = teamById(m.toss.winnerId);
  const inn  = ui.scInn === '2' ? m.inn2 : m.inn1;
  const batT = teamById(inn.teamId);

  return `<div class="sc-hero">
  <div style="font-family:var(--f-display);font-size:28px;letter-spacing:.4px">🏆 ${esc(w.name)} won ${m.result.super ? '(Super Over)' : `by ${m.result.margin} ${m.result.method}`}</div>
  <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;font-size:12px;color:var(--ink-dim)">
    <span>📍 ${esc(v ? v.name : '')}${v ? ', ' + esc(v.city) : ''}</span>
    <span>${v ? pitchBadge(v.pitch) : ''}</span>
    <span>🪙 ${esc(tw.short)} won toss, chose to ${m.toss.decision}</span>
  </div>
</div>
${motm ? `<div class="panel"><div class="panel-body"><div style="display:flex;align-items:center;gap:14px">
  <span style="font-size:38px">🏅</span>
  <div>
    <div style="font-family:var(--f-mono);font-size:9px;letter-spacing:.18em;color:var(--gold)">PLAYER OF THE MATCH</div>
    <div style="font-family:var(--f-display);font-size:24px">${esc(motm.name)}</div>
    <div style="font-family:var(--f-mono);font-size:12px;color:var(--ink-dim)">${motmLine(m, motm.id)}</div>
  </div>
</div></div></div>` : ''}
<div style="display:flex;gap:5px;margin-bottom:14px">
  <button class="inn-tab${ui.scInn !== '2' ? ' on' : ''}" data-act="scInn" data-id="1">${esc(teamById(m.inn1.teamId).short)} — ${m.inn1.runs}/${m.inn1.wickets}</button>
  <button class="inn-tab${ui.scInn === '2' ? ' on' : ''}" data-act="scInn" data-id="2">${esc(teamById(m.inn2.teamId).short)} — ${m.inn2.runs}/${m.inn2.wickets}</button>
</div>
<div class="panel">
  <div class="panel-head">
    <div class="panel-title">${pip(batT.color)} ${esc(batT.name)} — Batting</div>
    <span style="font-family:var(--f-mono);color:var(--ink-dim)">${inn.runs}/${inn.wickets} (${inn.overs} ov)</span>
  </div>
  <div class="panel-body flush">
    <table class="tbl">
      <thead><tr><th class="l">Batter</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr></thead>
      <tbody>
        ${inn.batting.filter(b => b.b > 0 || b.out).map(b => `<tr>
          <td class="l"><b>${esc(b.name)}</b><div style="font-size:10px;color:var(--ink-off)">${b.out ? dismissText(b) : 'not out'}</div></td>
          <td class="num"><b>${b.r}</b></td><td class="num">${b.b}</td><td class="num">${b.fours}</td><td class="num">${b.sixes}</td>
          <td class="num">${b.b ? (b.r / b.b * 100).toFixed(1) : '—'}</td>
        </tr>`).join('')}
        <tr style="font-weight:800;border-top:2px solid var(--line2);background:rgba(0,0,0,.2)">
          <td class="l">Total</td><td class="num">${inn.runs}</td><td class="num" colspan="4">${inn.wickets} wkts · ${inn.overs} ov</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
<div class="panel">
  <div class="panel-head"><div class="panel-title">Bowling</div></div>
  <div class="panel-body flush">
    <table class="tbl">
      <thead><tr><th class="l">Bowler</th><th>O</th><th>R</th><th>W</th><th>M</th><th>Econ</th></tr></thead>
      <tbody>
        ${inn.bowling.map(b => `<tr>
          <td class="l"><b>${esc(b.name)}</b></td>
          <td class="num">${ovStr(b.balls)}</td><td class="num">${b.runs}</td>
          <td class="num"><b style="${b.wkts >= 3 ? 'color:var(--gold)' : ''}">${b.wkts}</b></td>
          <td class="num">${b.maidens}</td>
          <td class="num">${b.balls ? (b.runs / (b.balls / 6)).toFixed(1) : '—'}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>
${inn.fow.length ? `<div class="panel"><div class="panel-head"><div class="panel-title">Fall of Wickets</div></div>
  <div class="panel-body"><div style="font-family:var(--f-mono);font-size:11px;color:var(--ink-dim);line-height:1.9">
    ${inn.fow.map(f => `<span>${f.wkt}-${f.runs} (${esc(f.batter)})</span>`).join(' · ')}
  </div></div></div>` : ''}`;
}

function dismissText(b) { return b.how === 'run out' ? 'run out' : (b.how + (b.bowlerName ? ' b ' + b.bowlerName.split(' ').pop() : '')); }
function motmLine(m, pid) {
  let bat = null, bowl = null;
  [m.inn1, m.inn2].forEach(inn => {
    const bb = inn.batting.find(x => x.id === pid && x.b > 0); if (bb) bat = bb;
    const bw = inn.bowling.find(x => x.id === pid && x.balls > 0); if (bw && bw.wkts > 0) bowl = bw;
  });
  const pts = [];
  if (bat)  pts.push(`${bat.r} (${bat.b})`);
  if (bowl) pts.push(`${bowl.wkts}/${bowl.runs}`);
  return pts.join(' & ') || 'match-winning impact';
}

/* ── STATS ── */
function renderStats() {
  if (!Object.keys(state.stats.bat || {}).length) return `<div class="empty-state" style="padding:80px">Stats accumulate as matches are played.</div>`;
  const o = orangeCap(), p = purpleCap(), tab = ui.statTab || 'bat';
  return `${phd('Leaderboards', 'Stats & Caps')}
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px">
  <div class="cap-card cap-orange"><span style="font-size:36px">🟧</span><div>
    <div style="font-family:var(--f-mono);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-dim)">Orange Cap · Most Runs</div>
    ${o ? `<div style="font-family:var(--f-display);font-size:26px;line-height:1;margin-top:5px">${esc(playerById(o.id).name)}</div>
      <div style="font-family:var(--f-mono);font-size:11.5px;color:var(--ink-dim);margin-top:3px">${o.runs} runs · HS ${o.hs}</div>` : `<div style="font-size:20px;margin-top:5px">—</div>`}
  </div></div>
  <div class="cap-card cap-purple"><span style="font-size:36px">🟪</span><div>
    <div style="font-family:var(--f-mono);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-dim)">Purple Cap · Most Wickets</div>
    ${p ? `<div style="font-family:var(--f-display);font-size:26px;line-height:1;margin-top:5px">${esc(playerById(p.id).name)}</div>
      <div style="font-family:var(--f-mono);font-size:11.5px;color:var(--ink-dim);margin-top:3px">${p.wkts} wkts · Best ${p.best}</div>` : `<div style="font-size:20px;margin-top:5px">—</div>`}
  </div></div>
</div>
<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:14px">
  ${[['bat','🏏 Batting'],['bowl','🎯 Bowling'],['field','🧤 Fielding'],['motm','🏅 MOTM']].map(([id,lbl]) =>
    `<button class="sc-tab${tab === id ? ' on' : ''}" data-act="statTab" data-id="${id}">${lbl}</button>`).join('')}
</div>
<div class="panel"><div class="panel-body flush">${statTable(tab)}</div></div>`;
}

function statTable(tab) {
  const rows = [];
  if (tab === 'bat') {
    for (const id in state.stats.bat) { const s = state.stats.bat[id]; if (s.runs > 0) { const p = playerById(id); if (p) rows.push({p,s}); } }
    rows.sort((a,b) => b.s.runs - a.s.runs);
    return `<table class="tbl"><thead><tr><th>#</th><th class="l">Player</th><th>Team</th><th>Inn</th><th>Runs</th><th>HS</th><th>Avg</th><th>SR</th><th>50/100</th></tr></thead><tbody>
    ${rows.slice(0,30).map(({p,s},i) => { const t=teamById(p.teamId); return `<tr class="${i===0?'leader':''}">
      <td class="num">${i+1}</td><td class="l"><b>${esc(p.name)}</b></td>
      <td>${pip(t.color)} ${esc(t.short)}</td>
      <td class="num">${s.inns}</td><td class="num"><b>${s.runs}</b></td><td class="num">${s.hs}</td>
      <td class="num">${s.outs?(s.runs/s.outs).toFixed(1):s.runs.toFixed(1)}</td>
      <td class="num">${s.balls?(s.runs/s.balls*100).toFixed(1):'—'}</td>
      <td class="num">${s.fifties}/${s.hundreds}</td>
    </tr>`; }).join('') || `<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--ink-off);font-style:italic">No batting data</td></tr>`}
    </tbody></table>`;
  }
  if (tab === 'bowl') {
    for (const id in state.stats.bowl) { const s = state.stats.bowl[id]; if (s.wkts > 0) { const p = playerById(id); if (p) rows.push({p,s}); } }
    rows.sort((a,b) => b.s.wkts - a.s.wkts || a.s.runs - b.s.runs);
    return `<table class="tbl"><thead><tr><th>#</th><th class="l">Player</th><th>Team</th><th>Inn</th><th>Wkts</th><th>Best</th><th>Econ</th><th>3W+</th></tr></thead><tbody>
    ${rows.slice(0,30).map(({p,s},i) => { const t=teamById(p.teamId); return `<tr class="${i===0?'leader':''}">
      <td class="num">${i+1}</td><td class="l"><b>${esc(p.name)}</b></td>
      <td>${pip(t.color)} ${esc(t.short)}</td>
      <td class="num">${s.inns}</td><td class="num"><b>${s.wkts}</b></td><td class="num">${s.best}</td>
      <td class="num">${s.balls?(s.runs/(s.balls/6)).toFixed(1):'—'}</td><td class="num">${s.threeW}</td>
    </tr>`; }).join('') || `<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--ink-off);font-style:italic">No bowling data</td></tr>`}
    </tbody></table>`;
  }
  if (tab === 'field') {
    for (const id in state.stats.field) { const s=state.stats.field[id]; if(s.catches+s.stumpings>0){const p=playerById(id);if(p)rows.push({p,s});} }
    rows.sort((a,b)=>(b.s.catches+b.s.stumpings)-(a.s.catches+a.s.stumpings));
    return `<table class="tbl"><thead><tr><th>#</th><th class="l">Player</th><th>Team</th><th>Catches</th><th>Stumpings</th><th>Total</th></tr></thead><tbody>
    ${rows.slice(0,30).map(({p,s},i)=>{const t=teamById(p.teamId);return `<tr class="${i===0?'leader':''}">
      <td class="num">${i+1}</td><td class="l"><b>${esc(p.name)}</b></td>
      <td>${pip(t.color)} ${esc(t.short)}</td>
      <td class="num">${s.catches}</td><td class="num">${s.stumpings}</td>
      <td class="num"><b>${s.catches+s.stumpings}</b></td>
    </tr>`; }).join('') || `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--ink-off);font-style:italic">No fielding data</td></tr>`}
    </tbody></table>`;
  }
  for(const id in state.stats.motm){const c=state.stats.motm[id];if(c>0){const p=playerById(id);if(p)rows.push({p,c});}}
  rows.sort((a,b)=>b.c-a.c);
  return `<table class="tbl"><thead><tr><th>#</th><th class="l">Player</th><th>Team</th><th>Awards</th><th>Form</th></tr></thead><tbody>
  ${rows.slice(0,30).map(({p,c},i)=>{const t=teamById(p.teamId);const fl=formLabel(p.form);return `<tr class="${i===0?'leader':''}">
    <td class="num">${i+1}</td><td class="l"><b>${esc(p.name)}</b></td>
    <td>${pip(t.color)} ${esc(t.short)}</td>
    <td class="num"><b>${c}</b> 🏅</td>
    <td><span class="fbadge ${fl.cls}" style="font-size:9px;padding:2px 7px">${fl.text}</span></td>
  </tr>`; }).join('') || `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--ink-off);font-style:italic">No data</td></tr>`}
  </tbody></table>`;
}

/* ── PLAYOFFS ── */
function renderPlayoffs() {
  if (['setup','auction','season'].includes(state.phase)) {
    const msg = state.phase==='season' ? `League is in round ${state.currentRound}/${totalRounds()} — finish all rounds first.` : 'Playoffs unlock after the league stage.';
    return `${phd('Knockouts','Playoffs')}<div class="empty-state" style="padding:60px"><div style="font-size:48px;margin-bottom:10px">🏆</div><div>${msg}</div></div>`;
  }
  const po = state.playoffs; if (!po) return `<div class="empty-state">Playoffs not set up.</div>`;
  const next = nextPlayoffTie();

  function tieCard(tie, cls='') {
    const a=tie.aId?teamById(tie.aId):null, b=tie.bId?teamById(tie.bId):null;
    const res=tie.resultId?resultById(tie.resultId):null;
    return `<div class="bracket-match${cls?' '+cls:''}">
      <div class="bracket-label">${tie.name}</div>
      <div class="bm-team${res&&res.result.winnerId===tie.aId?' bm-win':''}">${a?`${pip(a.color)} ${esc(a.short)}`:'<span class="faint">TBD</span>'}${res?`<span style="flex:1"></span><span style="font-family:var(--f-mono);font-size:12px">${innSFor(res,tie.aId)}</span>`:''}</div>
      <div class="bm-team${res&&res.result.winnerId===tie.bId?' bm-win':''}">${b?`${pip(b.color)} ${esc(b.short)}`:'<span class="faint">TBD</span>'}${res?`<span style="flex:1"></span><span style="font-family:var(--f-mono);font-size:12px">${innSFor(res,tie.bId)}</span>`:''}</div>
      ${res?`<div class="faint" style="font-size:10px">${esc(teamById(res.result.winnerId).short)} won</div>`:''}
    </div>`;
  }
  function innSFor(res,tid){const i=[res.inn1,res.inn2].find(x=>x.teamId===tid);return i?i.runs+'/'+i.wickets:'';}

  return `${stepper('playoffs')}
${phd('Knockouts','Playoffs','Q1 winner → Final. Loser plays Elim winner in Q2.')}
<div class="panel"><div class="panel-body">
  <div class="bracket">
    <div class="bracket-col">${tieCard(po.q1)}${tieCard(po.elim)}</div>
    <div class="bracket-col" style="justify-content:center">${tieCard(po.q2)}</div>
    <div class="bracket-col" style="justify-content:center">${tieCard(po.final,'final-match')}</div>
    <div class="bracket-col" style="justify-content:center">
      <div class="bracket-match final-match" style="align-items:center;text-align:center">
        <div class="bracket-label">Champion</div>
        ${po.championId ? `<div style="font-size:32px">🏆</div><div style="font-family:var(--f-display);font-size:18px;color:var(--gold)">${esc(teamById(po.championId).name)}</div>`
          : `<div class="faint">TBD</div>`}
      </div>
    </div>
  </div>
</div></div>
${isChair() ? `<div class="panel"><div class="panel-body" style="text-align:center;padding:24px">
  ${next ? `<button class="btn btn-live btn-lg" data-act="simPlayoff" data-id="${next}">▶ Play ${po[next].name}</button>`
    : po.championId ? `<button class="btn btn-primary btn-lg" data-act="showChampion">🏆 Replay Champion Ceremony</button>`
    : `<div class="dim">All ties complete.</div>`}
</div></div>` : ''}`;
}

/* ── ADMIN ── */
function renderAdmin() {
  if (!isChair()) return locked();
  return `${phd('Control Room','Admin','Delegate codes, trades, and season controls.')}
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
  <div class="panel">
    <div class="panel-head"><div class="panel-title">🔑 Delegate Codes</div><button class="btn btn-ghost btn-sm" data-act="genCodes">Regenerate</button></div>
    <div class="panel-body">
      ${state.teams.length ? state.teams.map(t => `<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line)">
        ${pip(t.color)}<span style="flex:1">${esc(t.name)}</span>
        <span style="font-family:var(--f-mono);font-size:15px;font-weight:700;letter-spacing:.22em;color:var(--gold);background:rgba(245,200,66,.06);padding:4px 12px;border-radius:7px;border:1px solid rgba(245,200,66,.17)">${esc(state.codes[t.id] || '····')}</span>
      </div>`).join('') : '<div class="empty-state">Build teams first.</div>'}
      <div class="hint" style="margin-top:10px">Share each code with the team delegate.</div>
    </div>
  </div>
  <div class="panel">
    <div class="panel-head"><div class="panel-title">🔄 Trade Desk</div>
      <span class="pbadge ${tradeWindowOpen() ? 'pitch-green' : 'pitch-balanced'}">${tradeWindowOpen() ? 'OPEN' : 'CLOSED'}</span>
    </div>
    <div class="panel-body">${renderTradeDesk()}</div>
  </div>
</div>
<div class="panel">
  <div class="panel-head"><div class="panel-title">⚙ Season Controls</div></div>
  <div class="panel-body">
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-ghost" data-act="exportState">⬇ Export Save</button>
      <button class="btn btn-ghost" data-act="triggerImport">⬆ Import Save</button>
      <input type="file" id="importFile" accept="application/json" class="hidden">
      <button class="btn btn-danger" data-act="confirmReset">🗑 Reset Everything</button>
    </div>
    <div class="hint">Auto-saves after every action. Export to back up or move between devices.</div>
  </div>
</div>`;
}

function renderTradeDesk() {
  if (state.phase !== 'season') return '<div class="empty-state">Trades open during the season.</div>';
  const aT = ui.tradeA ? teamById(ui.tradeA) : null, bT = ui.tradeB ? teamById(ui.tradeB) : null;
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
  <div><label style="font-family:var(--f-mono);font-size:9px;letter-spacing:.14em;color:var(--ink-dim);display:block;margin-bottom:5px">TEAM A</label>
    <select class="inp" data-act="tradeSelTeam" data-side="a">${optTeams(ui.tradeA)}</select>
    ${aT ? `<select class="inp" id="tradePlayerA" style="margin-top:8px">${squadOf(aT.id).map(p => `<option value="${p.id}">${esc(p.name)} (${ROLE_META[p.role].short} ${playerOverall(p)})</option>`).join('')}</select>` : ''}
  </div>
  <div><label style="font-family:var(--f-mono);font-size:9px;letter-spacing:.14em;color:var(--ink-dim);display:block;margin-bottom:5px">TEAM B</label>
    <select class="inp" data-act="tradeSelTeam" data-side="b">${optTeams(ui.tradeB)}</select>
    ${bT ? `<select class="inp" id="tradePlayerB" style="margin-top:8px">${squadOf(bT.id).map(p => `<option value="${p.id}">${esc(p.name)} (${ROLE_META[p.role].short} ${playerOverall(p)})</option>`).join('')}</select>` : ''}
  </div>
</div>
<button class="btn btn-primary btn-block" style="margin-top:12px" data-act="doTrade"
  ${aT && bT && aT.id !== bT.id && tradeWindowOpen() ? '' : 'disabled'}>Execute Trade ⇄</button>
${!tradeWindowOpen() ? '<div class="hint" style="color:var(--amber);margin-top:6px">Trade window is closed this round.</div>' : ''}`;
}
function optTeams(sel) { return '<option value="">Select…</option>' + state.teams.map(t => `<option value="${t.id}"${sel === t.id ? ' selected' : ''}>${esc(t.name)}</option>`).join(''); }

/* ── GUIDE ── */
function renderGuide() {
  return `${phd('How It Works','Guide')}
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
  <div class="panel"><div class="panel-head"><div class="panel-title">🎬 Session Flow</div></div><div class="panel-body">
    <ol style="counter-reset:g;display:flex;flex-direction:column;gap:12px">
      ${['<b>Setup</b>: 12 teams with individual budgets, real IPL grounds with editable pitch types.',
         '<b>Auction</b>: Players revealed set by set. Chair enters winning team and price for each.',
         '<b>Lineups</b>: Set Playing XI and batting aggression per team.',
         '<b>Season</b>: Simulate rounds. Form and injuries update automatically between rounds.',
         '<b>Crisis</b>: At 75% of the season, a star player is ruled out — a major shock moment.',
         '<b>Playoffs</b>: Top 4 compete. Champion ceremony with confetti.']
        .map((s,i)=>`<li style="font-size:13px;color:var(--ink-dim);padding-left:36px;position:relative;counter-increment:g">
          <span style="position:absolute;left:0;top:-2px;width:23px;height:23px;border-radius:7px;background:var(--glass3);color:var(--gold);font-family:var(--f-mono);font-size:11px;font-weight:700;display:grid;place-items:center">${i+1}</span>${s}</li>`).join('')}
    </ol>
  </div></div>

  <div class="panel"><div class="panel-head"><div class="panel-title">📐 Form & Injuries</div></div><div class="panel-body">
    <ul style="display:flex;flex-direction:column;gap:9px">
      ${['<b>Form (0–100)</b>: A player in form (🔥 Hot, 75+) plays above their rating by up to 30%. Cold players (📉, below 35) perform well below par.',
         '<b>Form drift</b>: After every round, each player\'s form shifts ±10–15 randomly. MOTM winners get a +10 bonus.',
         '<b>Injury Proneness (0–100)</b>: Determines P(injury) per round. Stars (Low) rarely get injured; budget players (High) go down more often.',
         '<b>Fixed duration</b>: Any injury means the player misses exactly 1 match, then recovers fully.',
         '<b>Squad impact</b>: Injured players are automatically excluded from auto-XI. Set your XI manually to always control who plays.']
        .map(s=>`<li style="font-size:13px;color:var(--ink-dim);padding-left:18px;position:relative"><span style="position:absolute;left:0;color:var(--gold)">▸</span>${s}</li>`).join('')}
    </ul>
  </div></div>

  <div class="panel"><div class="panel-head"><div class="panel-title">🏟 The 12 IPL Grounds</div></div><div class="panel-body">
    <ul style="display:flex;flex-direction:column;gap:7px">
      ${state.venues.map(v => `<li style="font-size:12.5px;color:var(--ink-dim);padding-left:18px;position:relative"><span style="position:absolute;left:0;color:var(--gold)">▸</span><b>${esc(v.city)}</b> — ${esc(v.name)} ${pitchBadge(v.pitch)}</li>`).join('')}
    </ul>
  </div></div>

  <div class="panel"><div class="panel-head"><div class="panel-title">⚙ Pitch Types</div></div><div class="panel-body">
    <ul style="display:flex;flex-direction:column;gap:9px">
      ${[['flat','Flat Belter','Pace and spin both get hit. High scores guaranteed. Batting heaven.'],
         ['dry','Dry Turner','Spinners reign. Low-ish scores, lots of wickets.'],
         ['green','Green Top','Pace bowlers rip through batting lineups. Low scores, high drama.'],
         ['balanced','Balanced','Fair contest. Both batting and bowling rewarded.']]
        .map(([k,n,d])=>`<li style="font-size:12.5px;color:var(--ink-dim);padding-left:18px;position:relative"><span style="position:absolute;left:0;color:var(--gold)">▸</span>${pitchBadge(k)} <b>${n}</b>: ${d}</li>`).join('')}
    </ul>
    <div class="hint">Change pitch types in Setup → Pitch Types before locking in the season.</div>
  </div></div>
</div>`;
}

/* ═══════════════════════════════════════════
   OVERLAYS
═══════════════════════════════════════════ */
function clearOverlay() { document.getElementById('overlay-root').innerHTML = ''; }

function confetti(n=90) {
  const colors=['#f5c842','#ff2060','#22d3ee','#22c55e','#38bdf8','#fb923c','#a855f7'];
  let h='<div class="confetti">';
  for(let i=0;i<n;i++){
    h+=`<i style="left:${Math.random()*100}%;background:${colors[i%colors.length]};animation-duration:${2.5+Math.random()*3}s;animation-delay:${Math.random()*2.5}s;transform:rotate(${Math.random()*360}deg)"></i>`;
  }
  return h+'</div>';
}

function showToss(home, away, onDone) {
  document.getElementById('overlay-root').innerHTML = `<div class="overlay" id="ovToss">
    <div class="ov-inner">
      <div style="font-family:var(--f-mono);font-size:11px;letter-spacing:.3em;color:var(--ink-dim)">THE TOSS</div>
      <div style="font-family:var(--f-display);font-size:32px;margin:10px 0;letter-spacing:.5px">
        <span style="color:${esc(home.color)}">${esc(home.short)}</span>
        <span style="color:var(--ink-off);margin:0 14px">vs</span>
        <span style="color:${esc(away.color)}">${esc(away.short)}</span>
      </div>
      <div class="toss-coin" id="tc"><div class="coin-side coin-h">H</div><div class="coin-side coin-t">T</div></div>
      <div style="font-family:var(--f-mono);font-size:12px;color:var(--ink-dim);margin-top:10px">Flipping…</div>
    </div>
  </div>`;
  setTimeout(() => { const c = document.getElementById('tc'); if (c) c.classList.add('spin'); }, 60);
  setTimeout(() => { clearOverlay(); if (onDone) onDone(); }, 2000);
}

function showCrisis(player) {
  const t = teamById(player.teamId);
  document.getElementById('overlay-root').innerHTML = `<div class="overlay overlay-crisis" data-act="dismissOverlay">
    <div class="ov-inner">
      <div style="font-size:76px;filter:drop-shadow(0 0 40px rgba(239,68,68,.6));animation:pulse 1.5s infinite">🚨</div>
      <div style="font-family:var(--f-display);font-size:52px;color:var(--red);letter-spacing:2px;margin:8px 0;text-shadow:0 0 40px rgba(239,68,68,.4)">SEASON CRISIS</div>
      <div style="font-family:var(--f-display);font-size:36px;margin-top:12px">${esc(player.name)}</div>
      <div style="color:var(--ink-dim);margin:10px 0 6px">${pip(t.color)} ${esc(t.name)}</div>
      <div style="font-family:var(--f-mono);font-size:12px;color:var(--ink-dim)">Ruled out for the rest of the season</div>
      <button class="btn btn-danger btn-lg" style="margin-top:26px" data-act="dismissOverlay">Acknowledge</button>
    </div>
  </div>`;
}

function showChampion() {
  const po = state.playoffs; if (!po || !po.championId) return;
  const champ = teamById(po.championId);
  const finalRes = resultById(po.final.resultId);
  const runner = finalRes ? teamById(finalRes.result.winnerId === po.final.aId ? po.final.bId : po.final.aId) : null;

  document.getElementById('overlay-root').innerHTML = `<div class="overlay overlay-champion" id="ovChamp">
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(245,200,66,.15),transparent 65%);animation:pulse 2.2s infinite"></div>
    ${confetti(130)}
    <div class="champ-stage" id="cs0">
      <div style="font-family:var(--f-mono);letter-spacing:.32em;text-transform:uppercase;color:var(--ink-dim);font-size:12px">And your ${esc(state.config.seasonName)} champions are…</div>
      <div style="display:flex;gap:14px;margin-top:24px"><i style="width:14px;height:14px;border-radius:50%;background:var(--ink-off);animation:tdot .9s infinite"></i><i style="width:14px;height:14px;border-radius:50%;background:var(--ink-off);animation:tdot .9s .22s infinite"></i><i style="width:14px;height:14px;border-radius:50%;background:var(--ink-off);animation:tdot .9s .44s infinite"></i></div>
    </div>
    <div class="champ-stage" id="cs1">
      <div style="font-family:var(--f-mono);letter-spacing:.32em;text-transform:uppercase;color:var(--ink-dim);font-size:12px">${esc(state.config.seasonName)}</div>
      <div style="font-size:96px;animation:float 3.5s ease-in-out infinite;filter:drop-shadow(0 0 50px rgba(245,200,66,.6))">🏆</div>
      <div style="font-family:var(--f-display);font-size:70px;letter-spacing:1px;line-height:.9;margin:14px 0;color:${esc(champ.color)};animation:champin .8s cubic-bezier(.16,1,.3,1)">${esc(champ.name)}</div>
      ${runner ? `<div style="color:var(--ink-dim);font-size:18px;margin-bottom:20px">Runners-up: ${esc(runner.name)}</div>` : ''}
      <div style="display:flex;flex-direction:column;gap:7px;min-width:300px;margin-top:20px">
        ${standings().slice(0,4).map((t,i)=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 14px;background:rgba(255,255,255,.04);border-radius:10px">
          <span style="font-family:var(--f-mono);color:var(--gold);min-width:20px">${i+1}</span>
          ${pip(t.color)}<span style="flex:1">${esc(t.name)}</span>
          <span style="font-family:var(--f-mono);color:var(--ink-dim)">${t.pts}pts</span>
        </div>`).join('')}
      </div>
      <button class="btn btn-primary btn-lg" style="margin-top:26px" data-act="finishCeremony">View Awards →</button>
    </div>
  </div>`;
  setTimeout(() => { const a = document.getElementById('cs0'); if(a) a.classList.add('on'); }, 100);
  setTimeout(() => { const a=document.getElementById('cs0'); if(a) a.classList.remove('on'); const b=document.getElementById('cs1'); if(b) b.classList.add('on'); }, 2200);
}

function showAwards() {
  const o = orangeCap(), p = purpleCap();
  let motmId=null, motmC=-1;
  for(const id in state.stats.motm){if(state.stats.motm[id]>motmC){motmC=state.stats.motm[id];motmId=id;}}
  const motmP = motmId&&motmC>0 ? playerById(motmId) : null;
  const awards = [];
  if(o) awards.push({emoji:'🟧',cat:'Orange Cap — Most Runs',name:playerById(o.id).name,detail:`${o.runs} runs · ${o.fifties}×50 · ${o.hundreds}×100`});
  if(p) awards.push({emoji:'🟪',cat:'Purple Cap — Most Wickets',name:playerById(p.id).name,detail:`${p.wkts} wickets · Best ${p.best}`});
  if(motmP) awards.push({emoji:'🏅',cat:'Most Valuable Player',name:motmP.name,detail:`${motmC} Player of the Match awards`});
  if(state.playoffs?.championId) awards.push({emoji:'🏆',cat:'Champions',name:teamById(state.playoffs.championId).name,detail:state.config.seasonName});
  if(!awards.length){clearOverlay();return;}
  ui.awardIdx=0; window.__awards=awards;
  showAwardSlide(awards);
}

function showAwardSlide(awards) {
  const i=ui.awardIdx||0, a=awards[i];
  document.getElementById('overlay-root').innerHTML=`<div class="overlay"><div class="ov-inner" style="max-width:500px;width:90%">
    ${i===awards.length-1?confetti(60):''}
    <div style="font-size:62px;margin-bottom:8px">${a.emoji}</div>
    <div style="font-family:var(--f-mono);font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-dim)">${esc(a.cat)}</div>
    <div style="font-family:var(--f-display);font-size:34px;color:var(--gold);margin:8px 0;text-shadow:0 0 40px rgba(245,200,66,.4)">${esc(a.name)}</div>
    <div style="font-family:var(--f-mono);color:var(--ink-dim)">${esc(a.detail)}</div>
    <div style="display:flex;gap:7px;justify-content:center;margin-top:20px">
      ${awards.map((_,k)=>`<i style="width:9px;height:9px;border-radius:50%;background:${k<i?'var(--green)':k===i?'var(--gold)':'var(--glass3)'};transition:.3s;transform:${k===i?'scale(1.35)':'scale(1)'};display:inline-block"></i>`).join('')}
    </div>
    <button class="btn btn-primary btn-lg" style="margin-top:24px" data-act="${i<awards.length-1?'nextAward':'dismissOverlay'}">${i<awards.length-1?'Next →':'Close 🎉'}</button>
  </div></div>`;
}

/* Auction player assignment modal */
function showAuctionModal(pid) {
  const p = playerById(pid);
  const fl = formLabel(p.form), ip = injuryLabel(p.injuryProne);
  document.getElementById('overlay-root').innerHTML = `
  <div class="backdrop" data-act="closeModal"></div>
  <div class="modal" style="max-width:580px">
    <div class="modal-head">
      <div class="modal-title">Assign Player</div>
      <button class="x-btn" data-act="closeModal">✕</button>
    </div>
    <div class="modal-body">
      <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--line)">
        <div style="flex:1">
          <div style="font-family:var(--f-display);font-size:28px">${esc(p.name)}</div>
          <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">
            ${roleBadge(p.role)}
            <span class="fbadge ${fl.cls}">${fl.text}</span>
            <span class="prone-badge ${ip.cls}" style="font-size:10px;padding:3px 8px">INJ Prone: ${ip.text}</span>
          </div>
          <div style="display:flex;gap:14px;margin-top:10px;font-family:var(--f-mono);font-size:12px">
            <span>BAT <b>${p.ratings.bat}</b></span>
            <span>BWL <b>${p.ratings.bowl}</b></span>
            <span>FLD <b>${p.ratings.field}</b></span>
            <span>OVR <b style="color:var(--gold)">${playerOverall(p)}</b></span>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-family:var(--f-mono);font-size:10px;color:var(--ink-dim)">BASE PRICE</div>
          <div style="font-family:var(--f-display);font-size:26px;color:var(--gold)">₹${p.basePrice}Cr</div>
        </div>
      </div>
      <div class="field" style="margin-bottom:14px">
        <label>Final Bid (₹ Crore)</label>
        <input class="inp" type="number" id="bidPrice" value="${p.basePrice}" min="0.25" step="0.25" style="font-family:var(--f-mono);font-size:16px">
      </div>
      <div class="field">
        <label>Assign to Team</label>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:7px;margin-top:8px">
          ${state.teams.map(t => {
            const full = squadOf(t.id).length >= state.config.squadSize;
            const over = (document.getElementById('bidPrice')?.value || p.basePrice) > t.budget;
            return `<button class="assign-btn" id="ab_${t.id}" data-act="confirmAuctionAssign" data-pid="${pid}" data-tid="${t.id}" ${full || over ? 'disabled' : ''}>
              ${pip(t.color)} ${esc(t.short)}
              <span style="margin-left:auto;font-family:var(--f-mono);font-size:9px;color:var(--ink-off)">₹${t.budget.toFixed(1)}</span>
            </button>`;
          }).join('')}
        </div>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-outline" data-act="markUnsold" data-pid="${pid}">Mark Unsold</button>
      <button class="btn btn-ghost" data-act="closeModal">Cancel</button>
    </div>
  </div>`;
}

/* ═══════════════════════════════════════════
   ACTIONS
═══════════════════════════════════════════ */
const ACT = {
  loginTab(el)    { ui.loginTab = el.dataset.id; render(); },

  doChairLogin() {
    const passEl = document.getElementById('loginPass');
    const pass = (passEl?.value || '').trim();
    if (pass === state.config.chairPassword || (pass === 'chair' && !state.teams.length)) {
      session = { role: 'chair', teamId: null };
      ui.page = state.phase === 'setup' ? 'setup' : state.phase === 'auction' ? 'auction' : 'matchday';
      render(); toast('Welcome, Chair', 'success');
    } else {
      const e = document.getElementById('loginErr');
      if (e) e.innerHTML = '<div class="login-err-box">Incorrect password. Default: <b>chair</b></div>';
    }
  },

  doDelegateLogin() {
    const codeEl = document.getElementById('loginCode');
    const code = (codeEl?.value || '').toUpperCase().trim();
    let tid = null;
    for (const id in state.codes) if (state.codes[id] === code) tid = id;
    if (tid) {
      session = { role: 'delegate', teamId: tid }; ui.page = 'squad'; ui.xiTeam = tid;
      render(); toast('Welcome, ' + teamById(tid).short + ' delegate', 'success');
    } else {
      const e = document.getElementById('loginErr');
      if (e) e.innerHTML = '<div class="login-err-box">Invalid code. Ask your Chair.</div>';
    }
  },

  logout() { session = { role: null, teamId: null }; render(); },

  nav(el) { ui.page = el.dataset.id; render(); },

  setupTab(el) { ui.setupTab = el.dataset.id; render(); },

  quickStart() {
    state = freshState();
    state.teams   = DEFAULT_TEAMS.map(d => makeTeamRecord({ ...d }));
    state.players = BUNDLED_PLAYERS.map((p, i) => ({
      ...p,
      id: 'bp_' + i + '_' + (p.name.replace(/\s+/g,'').slice(0,4).toLowerCase()),
    }));
    save(); render(); toast('12-team league ready — ' + state.players.length + ' real IPL players loaded', 'success');
  },

  loadDefaultTeams() {
    state.teams = DEFAULT_TEAMS.map(d => makeTeamRecord({ ...d }));
    save(); render(); toast('12 default teams loaded', 'success');
  },

  addTeam() {
    const n = state.teams.length + 1;
    const colors = ['#3b82f6','#ef4444','#8b5cf6','#22c55e','#f59e0b','#ec4899'];
    state.teams.push(makeTeamRecord({ name:'Team '+n, short:'T'+n, color:colors[n%colors.length]||'#6b7280', venueId:state.venues[0].id, purse:90 }));
    save(); render();
  },

  removeTeam(el)  { state.teams = state.teams.filter(t => t.id !== el.dataset.id); save(); render(); },

  genPool(el) {
    const n = +el.dataset.id;
    state.players = generatePlayerPool(Date.now(), n);
    save(); render(); toast(`${n} players generated with form & injury ratings`, 'success');
  },

  clearPool() { state.players = []; save(); render(); },

  triggerCSVImport() { document.getElementById('csvPlayerFile')?.click(); },

  beginAuction() {
    if (state.teams.length < 2)       { toast('Add at least 2 teams', 'warn'); return; }
    if (state.players.length < 11)    { toast('Generate a player pool first', 'warn'); return; }
    startAuction();
    ui.page = 'auction'; ui.auctionSet = 0;
    render(); toast('Auction started — reveal players set by set', 'success');
  },

  selectAuctionSet(el) { ui.auctionSet = +el.dataset.id; render(); },

  openAuctionPlayer(el) { showAuctionModal(el.dataset.id); },

  confirmAuctionAssign(el) {
    const pid = el.dataset.pid, tid = el.dataset.tid;
    const priceEl = document.getElementById('bidPrice');
    const price = parseFloat(priceEl?.value) || playerById(pid)?.basePrice || 0.5;
    const r = auctionAssign(pid, tid, price);
    if (r.ok) { clearOverlay(); render(); toast(`${playerById(pid)?.name} sold to ${teamById(tid)?.short} for ₹${price}Cr`, 'success'); }
    else toast(r.msg || 'Cannot assign', 'error');
  },

  markUnsold(el) { auctionMarkUnsold(el.dataset.pid); clearOverlay(); render(); toast('Marked unsold', 'info'); },

  finalizeAuction() {
    if (!allSquadsOk()) { toast('Every team needs 11+ players', 'warn'); return; }
    doFinalizeAuction();
    ui.page = 'strategy';
    render(); toast('Season generated! Set lineups and aggression.', 'success');
  },

  editVenuePitch(el) {
    const v = state.venues.find(x => x.id === el.dataset.id);
    if (v) { v.pitch = el.value; save(); }
  },

  selectSquad(el) { ui.xiTeam = el.dataset.id; render(); },

  autoXI(el) {
    const t = teamById(el.dataset.id);
    if (t) { t.xi = autoXI(squadOf(t.id)); save(); render(); toast('XI auto-picked', 'success'); }
  },

  toggleXI(el) {
    const pid = el.dataset.id, tid = el.dataset.team, t = teamById(tid);
    if (!t) return;
    let xi = t.xi?.length ? t.xi.slice() : autoXI(squadOf(tid));
    if (xi.includes(pid)) xi = xi.filter(x => x !== pid);
    else { if (xi.length >= 11) { toast('XI is full — remove one first', 'warn'); return; } xi.push(pid); }
    t.xi = xi; save(); render();
  },

  simRound() {
    const rd = currentRoundData(); if (!rd) { toast('No round data', 'warn'); return; }
    const home = teamById(rd.matches[0].homeId), away = teamById(rd.matches[0].awayId);
    showToss(home, away, () => {
      const played = playCurrentRound();
      // Check for century milestone
      let milestone = null;
      played.forEach(m => [m.inn1,m.inn2].forEach(inn => inn.batting.forEach(b => {
        if (b.r >= 100 && !milestone) milestone = { title:'CENTURY!', player:b.name, stat:`${b.r} off ${b.b} balls` };
      })));
      const crisis = maybeFireCrisis();
      ui.page = 'live'; render();
      if (milestone) setTimeout(() => showMilestone(milestone.title, milestone.player, milestone.stat), 400);
      else if (crisis) setTimeout(() => showCrisis(crisis), 400);
      toast(`Round ${state.currentRound} simulated — ${played.length} matches`, 'success');
    });
  },

  advanceRound() {
    const played = state.resultOrder.slice(-currentRoundData()?.matches.length).map(id => state.results[id]).filter(Boolean);
    const injLog = processBetweenRounds(played);
    const r = advanceRound();
    if (r.done) { ui.page = 'playoffs'; toast('League complete — playoffs set!', 'success'); }
    else {
      ui.page = 'matchday';
      const newInj = injLog.filter(x => x.type === 'injury').length;
      if (newInj) toast(`${newInj} new injur${newInj > 1 ? 'ies' : 'y'} · Form updated for all players`, 'warn');
      else        toast('Form updated for all players · Advance to Round ' + r.round, 'info');
    }
    render();
  },

  openScorecard(el) { ui.scOpenId = el.dataset.id; ui.scInn = '1'; ui.page = 'scorecards'; render(); },
  scInn(el)         { ui.scInn = el.dataset.id; render(); },
  statTab(el)       { ui.statTab = el.dataset.id; render(); },

  simPlayoff(el) {
    const key = el.dataset.id, po = state.playoffs;
    if (!po || !po[key]) return;
    const tie = po[key];
    const home = teamById(tie.aId), away = teamById(tie.bId);
    if (!home || !away) { toast('Teams not yet determined', 'warn'); return; }
    showToss(home, away, () => {
      const m = playPlayoffTie(key);
      render();
      if (state.phase === 'complete') setTimeout(() => showChampion(), 600);
      else toast(po[key].name + ' complete', 'success');
    });
  },

  showChampion()  { showChampion(); },
  finishCeremony(){ showAwards(); },
  nextAward()     { ui.awardIdx = (ui.awardIdx || 0) + 1; showAwardSlide(window.__awards); },
  dismissOverlay(el, e) {
    if (e && !el.matches('[data-act=dismissOverlay].btn, .overlay-crisis.overlay')) return;
    clearOverlay();
  },

  genCodes() { state.teams.forEach(t => state.codes[t.id] = genCode()); save(); render(); toast('Codes regenerated', 'success'); },

  tradeSelTeam(el) { if (el.dataset.side === 'a') ui.tradeA = el.value||null; else ui.tradeB = el.value||null; render(); },

  doTrade() {
    const aP = document.getElementById('tradePlayerA')?.value;
    const bP = document.getElementById('tradePlayerB')?.value;
    if (!ui.tradeA || !ui.tradeB || !aP || !bP) { toast('Select both players', 'warn'); return; }
    const r = executeTrade(ui.tradeA, aP, ui.tradeB, bP);
    if (r.ok) { ui.tradeA = null; ui.tradeB = null; toast('Trade complete', 'success'); render(); }
    else toast(r.msg || 'Trade failed', 'error');
  },

  exportState() {
    const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
    const url  = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'ipl-mun-save.json'; a.click();
    URL.revokeObjectURL(url); toast('League exported', 'success');
  },
  triggerImport() { document.getElementById('importFile')?.click(); },

  confirmReset() {
    document.getElementById('overlay-root').innerHTML = `<div class="backdrop"></div>
    <div class="modal"><div class="modal-head"><div class="modal-title">Reset Everything?</div></div>
      <div class="modal-body"><p style="color:var(--ink-dim)">This permanently deletes all teams, players, and results. Cannot be undone.</p></div>
      <div class="modal-foot"><button class="btn btn-ghost" data-act="closeModal">Cancel</button><button class="btn btn-danger btn-lg" data-act="doReset">Yes, Reset</button></div>
    </div>`;
  },

  doReset() {
    state = freshState(); session = { role:'chair', teamId:null };
    ui = { page:'setup', setupTab:'teams', scOpenId:null, scInn:'1', statTab:'bat', xiTeam:null, loginTab:'chair', awardIdx:0, auctionSet:0, tradeA:null, tradeB:null };
    save(); clearOverlay(); render(); toast('League reset', 'info');
  },

  closeModal() { clearOverlay(); },
};

function showMilestone(title, player, stat) {
  document.getElementById('overlay-root').innerHTML = `<div class="overlay" data-act="dismissOverlay">
    <div class="ov-inner">${confetti(50)}
      <div style="font-size:76px;margin-bottom:6px">🎉</div>
      <div style="font-family:var(--f-display);font-size:60px;color:var(--gold);letter-spacing:1px;text-shadow:0 0 60px rgba(245,200,66,.5)">${esc(title)}</div>
      <div style="font-size:22px;margin-top:6px">${esc(player)}</div>
      <div style="font-family:var(--f-mono);color:var(--ink-dim);margin-top:5px">${esc(stat)}</div>
    </div>
  </div>`;
  setTimeout(() => clearOverlay(), 3000);
}

/* ─── Field editors (input/change events) ─── */
function handleFieldEdit(el) {
  const act = el.dataset.act;
  if (act === 'editTeam') {
    const t = teamById(el.dataset.id); if (!t) return;
    const f = el.dataset.field;
    if (f === 'short') t[f] = el.value.toUpperCase().slice(0, 4);
    else if (f === 'purse') { t.purse = +el.value || 90; if (state.phase === 'setup') t.budget = t.purse; }
    else t[f] = el.value;
    save();
  } else if (act === 'editConfig') {
    const f = el.dataset.field;
    let v = el.value;
    if (['squadSize','tradeWindowEvery'].includes(f)) v = Math.max(1, +v || 0);
    state.config[f] = v;
    save();
  }
}

/* ═══════════════════════════════════════════
   EVENT DELEGATION
═══════════════════════════════════════════ */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act;
  if (act === 'editTeam' || act === 'editConfig') return;
  if (ACT[act]) { e.preventDefault(); ACT[act](el, e); }
});

document.addEventListener('input', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act;
  if (act === 'editTeam' || act === 'editConfig') handleFieldEdit(el);
  if (act === 'editVenuePitch') ACT.editVenuePitch(el);
});

document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'csvPlayerFile' && el.files?.[0]) {
    const fr = new FileReader();
    fr.onload = () => {
      const r = parsePlayerCSV(fr.result);
      if (!r.ok) { toast(r.msg || 'CSV parse failed', 'error'); return; }
      state.players = r.players;
      save(); render();
      const warn = r.errors.length ? ' (' + r.errors.length + ' rows skipped)' : '';
      toast(r.players.length + ' players loaded from CSV' + warn, 'success');
    };
    fr.readAsText(el.files[0]);
    el.value = ''; // allow re-import same file
    return;
  }
  if (el.id === 'importFile' && el.files?.[0]) {
    const fr = new FileReader();
    fr.onload = () => {
      try { state = migrateState(JSON.parse(fr.result)); save(); ui.page = 'matchday'; render(); toast('League imported', 'success'); }
      catch (_) { toast('Invalid save file', 'error'); }
    };
    fr.readAsText(el.files[0]);
  }
  if (el.dataset?.act === 'editTeam' || el.dataset?.act === 'editConfig') handleFieldEdit(el);
  if (el.dataset?.act === 'editVenuePitch') ACT.editVenuePitch(el);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const ov = document.getElementById('overlay-root');
    if (ov?.innerHTML.trim() && !ov.querySelector('.overlay-champion')) clearOverlay();
  }
});

/* ═══════════════════════════════════════════
   BOOT
═══════════════════════════════════════════ */
function boot() {
  const had = load();
  session = { role: null, teamId: null };
  if (!had) {
    // Pre-populate default teams so login page feels ready
    state.teams = DEFAULT_TEAMS.map(d => makeTeamRecord({ ...d }));
  }
  render();
}
boot();