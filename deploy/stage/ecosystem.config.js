module.exports = {
  apps: [
    {
      name: "supreme-salmon-liff",
      exec_mode: "cluster",
      instances: "2", // Or a number of instances
      script: "./node_modules/next/dist/bin/next",
      args: "start --port 5051",
      cwd: "/var/www/supreme-salmon-liff/webroot",
    },
  ],
};
