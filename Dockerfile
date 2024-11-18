FROM node:20 as frontend-build

COPY ./src/frontend /usr/src
WORKDIR /usr/src

RUN npm install --legacy-peer-deps
RUN npm run build

FROM geonode/geonode-base:latest-ubuntu-22.04
LABEL GeoNode development team

RUN mkdir -p /usr/src/t4msp

RUN apt-get update -y && apt-get install curl wget unzip gnupg2 locales -y

RUN sed -i -e 's/# C.UTF-8 UTF-8/C.UTF-8 UTF-8/' /etc/locale.gen && \
    locale-gen
ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8

# add bower and grunt command
COPY src /usr/src/t4msp/
WORKDIR /usr/src/t4msp

#COPY src/monitoring-cron /etc/cron.d/monitoring-cron
#RUN chmod 0644 /etc/cron.d/monitoring-cron
#RUN crontab /etc/cron.d/monitoring-cron
#RUN touch /var/log/cron.log
#RUN service cron start

COPY src/wait-for-databases.sh /usr/bin/wait-for-databases
RUN chmod +x /usr/bin/wait-for-databases
RUN chmod +x /usr/src/t4msp/tasks.py \
    && chmod +x /usr/src/t4msp/entrypoint.sh

COPY src/celery.sh /usr/bin/celery-commands
RUN chmod +x /usr/bin/celery-commands

COPY src/celery-cmd /usr/bin/celery-cmd
RUN chmod +x /usr/bin/celery-cmd

# Install "geonode-contribs" apps
# RUN cd /usr/src; git clone https://github.com/GeoNode/geonode-contribs.git -b master
# Install logstash and centralized dashboard dependencies
# RUN cd /usr/src/geonode-contribs/geonode-logstash; pip install --upgrade  -e . \
#     cd /usr/src/geonode-contribs/ldap; pip install --upgrade  -e .

RUN yes w | pip install --src /usr/src -r requirements.txt &&\
    yes w | pip install -e .

# Copy the static files from previous layer
COPY --from=frontend-build /usr/src/static /usr/src/t4msp/frontend/static
COPY --from=frontend-build /usr/src/webpack-stats.json /usr/src/t4msp/frontend/webpack-stats.json

# Cleanup apt update lists
RUN apt-get autoremove --purge &&\
    apt-get clean &&\
    rm -rf /var/lib/apt/lists/*

# Export ports
EXPOSE 8000

# We provide no command or entrypoint as this image can be used to serve the django project or run celery tasks
# ENTRYPOINT /usr/src/t4msp/entrypoint.sh
