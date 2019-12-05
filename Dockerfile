FROM ubuntu:18.04

# Install dependencies
RUN apt update
RUN apt dist-upgrade --yes
RUN apt install --yes ssh
RUN apt install --yes npm nodejs gosu

# Install the script that sets up the user environment
# and runs CMD as the current user instead of as root
COPY scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]