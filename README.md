INTRODUCTION
============
My TwitterMap is the app that shows the coordinates of Tweets and displays the detail information of each tweets with exact geo information.

USAGE
=====
My TwitterMap app is 100% realtime. I choose "game" as the default keyword. Once there is a tweets matching the keyword and with exact geo information, a marker will appear on the map immediately. You can change the keyword, in this case, server.js will read data from RDS and send them to the front-end. The frond-end will show the latest 1000 tweets with this keyword while listenning tweets stream. The data of heatmap comes totally from the RDS.


DESIGN
======
Tweets Collection: ntwitter->collect streamed tweets from Twitter Streaming API.

Tweets Database: RDS

Server: socket.io is used to interact with front-end, and server.js is acted as the middle man between RDS and front-end.

Front-End: Google Map API, Bootstrap, JQuery, socket.io


ATTENTION!!!
============
Because of limiting time, I failed to totally achieve the final step. In fact, I use command "node server.js" to test in local, and the web app performs normally. When I deployed to the EBS, althought it shows OK and the web page can be opened, the server.js seemed to fail to run in EBS because I noticed the number of connections in RDS is 0. So weird. I looked up everywhere but still couldn't find the answer. Sorry for that. 

I will greatly appreciate if you can help. Thank you.
