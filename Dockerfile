FROM mhart/alpine-node:latest

RUN mkdir -p /opt/willbot-cli
RUN npm install nodemon -g

WORKDIR /opt/willbot-cli

ADD ./willbot-cli/nodemon.json /opt/willbot-cli/nodemon.json
ADD ./willbot-cli/package.json /opt/willbot-cli/package.json
RUN cd /opt/willbot-cli/ && npm install

#RUN npm link
#EXPOSE 3000
#CMD /bin/sh
CMD npm start