# ==============================================================================
# DecodeLabs Industrial Training Kit — DevOps Project 4: Containerization with Docker
# Application: DevOps Project Tracker Web Application
# ==============================================================================

# ------------------------------------------------------------------------------
# INSTRUCTION: FROM
# Defines the non-negotiable starting point (base image).
# We choose nginx:alpine because:
#   1. Extremely lightweight (< 25 MB vs hundreds of MBs for Ubuntu/Debian).
#   2. Multi-architecture support: Native on Apple Silicon (arm64) and x86_64 (amd64).
#   3. Drastically reduced security attack surface (no unnecessary compilers/utilities).
#   4. Production-grade web server optimized for high-performance static delivery.
# ------------------------------------------------------------------------------
FROM nginx:alpine

# ------------------------------------------------------------------------------
# METADATA: LABEL
# Organizes images, facilitates container auditing, and documents authorship.
# ------------------------------------------------------------------------------
LABEL maintainer="DecodeLabs DevOps Intern <devops@decodelabs.tech>" \
      project="DevOps Project 4: Containerization with Docker" \
      batch="2026" \
      version="1.0" \
      description="Lightweight Nginx Alpine container serving the DevOps Project Tracker"

# ------------------------------------------------------------------------------
# INSTRUCTION: WORKDIR
# Sets the internal working directory inside the container for all subsequent
# COPY, RUN, and CMD instructions. Standard Nginx web document root is used.
# ------------------------------------------------------------------------------
WORKDIR /usr/share/nginx/html

# ------------------------------------------------------------------------------
# INSTRUCTION: RUN
# Executes build-time actions. We remove default Nginx boilerplate files to ensure
# only our custom application code is served.
# ------------------------------------------------------------------------------
RUN rm -rf ./*

# ------------------------------------------------------------------------------
# INSTRUCTION: COPY
# Transfers application files from the local build context on your host machine
# into the container filesystem at WORKDIR (/usr/share/nginx/html).
# Layering strategy: Copy application assets cleanly and deterministically.
# ------------------------------------------------------------------------------
COPY index.html ./
COPY style.css ./
COPY script.js ./

# ------------------------------------------------------------------------------
# INSTRUCTION: EXPOSE
# Acts as documentation between the image author and the container operator,
# declaring that the process inside listens on port 80.
# (Note: Port publishing to host requires the -p flag at runtime, e.g., -p 8080:80).
# ------------------------------------------------------------------------------
EXPOSE 80

# ------------------------------------------------------------------------------
# INSTRUCTION: HEALTHCHECK
# Periodically probes the web server to verify application availability.
# Returns exit code 0 if healthy, exit code 1 if the web server fails to respond.
# ------------------------------------------------------------------------------
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q -O /dev/null http://localhost/ || exit 1

# ------------------------------------------------------------------------------
# INSTRUCTION: CMD (JSON Exec Form)
# Specifies the default runtime execution command and arguments.
# We use the JSON Exec form ["nginx", "-g", "daemon off;"] so Nginx runs directly
# as PID 1 without an intermediary shell wrapper (/bin/sh -c), allowing graceful
# handling of UNIX signals (SIGTERM/SIGINT) upon container stop.
# "daemon off;" keeps Nginx in the foreground so the container does not exit immediately.
# ------------------------------------------------------------------------------
CMD ["nginx", "-g", "daemon off;"]
