module.exports = {
  apps: [
    {
      name: "supreme-salmon-liff",

      // Next.js standalone output
      script: "server.js",
      cwd: "C:\\sites\\supreme-salmon-liff\\current",

      exec_mode: "cluster",
      instances: 2,

      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },

      max_memory_restart: "512M",

      error_file: "C:\\deploy\\logs\\supreme-salmon-liff-error.log",
      out_file: "C:\\deploy\\logs\\supreme-salmon-liff-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
