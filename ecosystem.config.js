module.exports = {
  apps: [
    {
      name: 'tree-doctor-backend',
      script: 'uvicorn',
      args: 'backend.web_api.main:app --host 0.0.0.0 --port 8001',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        DATABASE_URL: 'postgresql://tree_doctor:tree_doctor_password@localhost:5432/tree_doctor',
        REDIS_URL: 'redis://localhost:6379',
        ENVIRONMENT: 'development'
      }
    },
    {
      name: 'tree-doctor-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: './frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'tree-doctor-ngrok',
      script: 'ngrok',
      args: 'start --config ngrok.yml frontend',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
