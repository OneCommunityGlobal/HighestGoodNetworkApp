# Define a imagem base
FROM node:14-alpine
# Set the working directory to /app
WORKDIR /app
# Copy the package.json and yarn.lock files to the container
COPY package.json yarn.lock ./
# Install dependencies
RUN yarn install
# Copy the rest of the app files to the container
COPY . ./
# Build the app
RUN yarn build
# Expose port 3000
EXPOSE 3000
# Set the startup command to run the app using Node.js
CMD ["yarn", "start:local"]