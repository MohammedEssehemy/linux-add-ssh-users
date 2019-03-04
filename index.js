const { execSync } = require('child_process');
const fs = require('fs');

const users = require('./users.json');
const sudoersFilePath = '/etc/sudoers.txt';

const addUserToUserAlias = (username, userAlias) => {
    const sudoersFile = fs.readFileSync(sudoersFilePath, 'utf8');
    const lines = sudoersFile.split('\n');
    let targetLine = lines.findIndex(l => l.includes("User_Alias") && l.includes(userAlias));
    if (lines[targetLine]) lines[targetLine] += `, ${username}`;
    fs.writeFileSync(sudoersFilePath, lines.join('\n'));
}

users.forEach(({ username, key, userAlias, comment }) => {
    const homeDir = `/home/.${username}`;
    execSync(`adduser -G root --home-dir ${homeDir} --comment ${comment} ${username}`);
    addUserToUserAlias(username, userAlias);
    // allow rootsh escalation on login
    execSync(`echo "exec sudo /usr/local/bin/rootsh --no-syslog" >> ${homeDir}/.bashrc`);
    // set key on quthorized_keys
    execSync(`mkdir ${homeDir}/.ssh && echo "${key}" >> ${homeDir}/.ssh/authorized_keys`);
    console.info(`user ${username} created`);
})