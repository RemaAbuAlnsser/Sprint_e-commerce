module.exports = {
  apps: [
    {
      name: 'spirit-api',
      script: 'dist/main.js',
      cwd: '/var/www/Spirit/backend',

      // هذا السطر هو المفتاح 🔑
      env_file: '.env.production',

      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
