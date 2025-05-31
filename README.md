<h1 align="center">Transcendence</h1>

<p align="center">
  <img alt="Github top language" src="https://img.shields.io/github/languages/top/mkati42/Transcendence?color=blue">
  <img alt="Github language count" src="https://img.shields.io/github/languages/count/mkati42/Transcendence?color=blue">
  <img alt="Repository size" src="https://img.shields.io/github/repo-size/mkati42/Transcendence?color=blue">
  <img alt="License" src="https://img.shields.io/github/license/mkati42/Transcendence?color=blue">
</p>

<p align="center">
  <a href="#dart-about">About</a> &#xa0; | &#xa0;
  <a href="#sparkles-features">Features</a> &#xa0; | &#xa0;
  <a href="#rocket-technologies">Technologies</a> &#xa0; | &#xa0;
  <a href="#white_check_mark-requirements">Requirements</a> &#xa0; | &#xa0;
  <a href="#checkered_flag-starting">Starting</a> &#xa0; | &#xa0;
  <a href="#books-architecture">Architecture</a> &#xa0; | &#xa0;
  <a href="#memo-license">License</a> &#xa0; | &#xa0;
  <a href="https://github.com/mkati42" target="_blank">Author</a>
</p>

<br>

## :dart: About

**Transcendence** is a full-stack web application built as a capstone project at Ecole 42. It combines real-time multiplayer gaming with user authentication, social interaction, tournaments, and security features. The application is developed with a microservice architecture using Docker, Django, PostgreSQL, and a JavaScript-based SPA frontend.

## :sparkles: Features

- 🎮 Real-time Pong Game with WebSocket communication  
- 🧑‍🤝‍🧑 User registration with email, 42 Intra OAuth, and QR code  
- 🏆 Tournament creation, player matchmaking, and progression tracking  
- 👤 User profiles with editable personal info and links  
- 💬 Online multiplayer, private games, and spectating  
- 🔒 CSRF and CORS protection with secure backend logic  
- 📦 Microservices architecture with Docker and Nginx  

## :rocket: Technologies

This project utilizes the following technologies:

- **Backend:** Python, Django, Django REST Framework  
- **Frontend:** HTML, CSS, JavaScript (SPA-based)  
- **Database:** PostgreSQL  
- **Authentication:** JWT, 42 OAuth, QR login  
- **WebSocket/Game:** Channels, Django ASGI, JS Canvas  
- **Deployment:** Docker, Docker Compose, Nginx  
- **Dev Tools:** Git, VS Code, Makefile, .env configs  

## :white_check_mark: Requirements

Before starting, make sure you have the following installed:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Make](https://www.gnu.org/software/make/)

## :checkered_flag: Starting

```bash
# Clone this repository
$ git clone https://github.com/mkati42/Transcendence.git

# Navigate into the project directory
$ cd Transcendence

# Run the app (frontend + backend + OAuth)
$ make up

# Visit the app in your browser
$ open http://localhost:80  # or http://my_pong.com.tr if configured
