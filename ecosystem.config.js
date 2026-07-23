module.exports = {
  apps: [
    {
      name: "lekayo",
      cwd: "/var/www/lekayo",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,          // bump to "max" for cluster mode once you outgrow one core
      exec_mode: "fork",     // switch to "cluster" if you go multi-instance
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // PM2 does NOT read .env automatically — Next.js itself loads .env at the
      // project root at build/runtime, so keep /var/www/lekayo/.env in place.
      error_file: "/var/log/pm2/lekayo-error.log",
      out_file: "/var/log/pm2/lekayo-out.log",
      time: true,
    },
  ],
};
