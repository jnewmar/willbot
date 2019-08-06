FROM mhart/alpine-node:latest

#ADD package.json /tmp/package.json
#RUN cd /tmp && npm install
#RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/
#RUN npm install -g nodemon
#WORKDIR /opt/app
#COPY . /opt/app

RUN mkdir -p /opt/app
RUN npm install nodemon -g

WORKDIR /opt/app
ADD package.json /opt/app/package.json
RUN cd /opt/app/ && npm install

ADD nodemon.json /opt/app/nodemon.json

EXPOSE 3000

CMD npm start