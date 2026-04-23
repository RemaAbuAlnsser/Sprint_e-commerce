// PM2 Ecosystem Configuration for Magnetix Tech
// المسار على VPS: /var/www/MagnetixTech/Magnetix

module.exports = {
  apps: [
    {
      name: 'magnetix-backend',
      cwd: '/var/www/MagnetixTech/Magnetix/backend',
      script: 'dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 9000
      },
      error_file: '/var/www/MagnetixTech/Magnetix/logs/backend-error.log',
      out_file: '/var/www/MagnetixTech/Magnetix/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },
    {
      name: 'magnetix-frontend',
      cwd: '/var/www/MagnetixTech/Magnetix/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3005',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3005
      },
      error_file: '/var/www/MagnetixTech/Magnetix/logs/frontend-error.log',
      out_file: '/var/www/MagnetixTech/Magnetix/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
