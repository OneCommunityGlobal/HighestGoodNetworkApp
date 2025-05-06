# Define the base image
FROM node:14-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files to the container
COPY . .

# Build the app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Set the startup command to run the app using Node.js
CMD ["npm", "run", "start:local"]
