module.exports.errorMessage = (err, url) => `
=========
⚠️ Server is down ${url} ⚠️
  
  \`\`\`
  ${err}
  \`\`\`

=========
`;

module.exports.serverIsBackOnlineMessage = (url) => `
=========
🎉 Server is back online ${url} 🎉
=========
`;
