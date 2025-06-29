class Terminal {
  constructor() {
    this.terminal = document.getElementById('terminal');
    this.commandHistory = [];
    this.historyIndex = -1;
    this.data = {};
    this.baseUrl = 'https://daffi1238.github.io';
    this.init();
  }

  async init() {
    await this.loadData();
    await this.startBootSequence();
  }

  async loadData() {
    try {
      const dataFiles = ['help', 'whoami', 'education', 'experience', 'skills', 'contact', 'projects'];
      for (const file of dataFiles) {
        const response = await fetch(`${this.baseUrl}/data/${file}.json`);
        this.data[file] = await response.json();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback data if JSON files can't be loaded
      this.loadFallbackData();
    }
  }

  loadFallbackData() {
    this.data = {
      help: {
        title: "Available commands:",
        commands: ["help", "whoami", "education", "experience", "skills", "contact", "projects", "clear"],
        description: "Type any command above to get more information about that section."
      },
      whoami: {
        title: "👤 User Information",
        ascii_art: "          _                           _ \n__      _| |__   ___   __ _ _ __ ___ (_)\n\\ \\ /\\ / / '_ \\ / _ \\ / _` | '_ ` _ \\| |\n \\ V  V /| | | | (_) | (_| | | | | | | |\n  \\_/\\_/ |_| |_|\\___/ \\__,_|_| |_| |_|_|",
        user: {
          name: "Jesus A. Sumariva",
          username: "daffi1238",
          role: "Ethical Hacker - Penetration Tester",
          location: "Spain",
          age: "31",
          status: "Available for new opportunities"
        },
        description: "Cybersecurity enthusiast with a passion for dismantling and hardening systems. Specialized in ethical hacking, advanced web exploitation, and red team operations. Always learning, always scanning, always ready.",
        interests: [
          "🚨 Web App Hacking & Web Breakage",
          "☁️ Cloud Pwnage & Security",
          "🔓 Open Source Recon Tools",
          "📱 Mobile Exploitation (iOS & Android)",
          "🛠️ Dev tools & Custom Scripts",
          "💣 Red Team Ops & Social Engineering",
          "🎯 0-day & n-day vulnerability hunting"
        ],
        certifications: [
          "💀 Offensive Security Certified Professional (OSCP)",
          "🎯 Certified Red Team Operator (CRTO)",
          "🚩 2nd place in Nuwe-CTF (Schneider Electric)"
        ],
        languages: ["Spanish (Native)", "English (Fluent)", "Portuguese (Intermediate)"]
      },
      education: {
        title: "📘 Education",
        items: [
          {
            degree: "B.Sc. in Computer Science",
            institution: "XYZ University",
            period: "2016–2020",
            description: "Specialized in Software Engineering and Web Development"
          }
        ]
      },
      experience: {
        title: "💼 Experience",
        items: [
          {
            position: "Senior Frontend Developer",
            company: "TechCorp",
            period: "2021–2024",
            description: "Led development of React-based applications, mentored junior developers, and implemented CI/CD pipelines."
          }
        ]
      },
      skills: {
        title: "🛠️ Skills",
        categories: [
          {
            name: "Frontend",
            skills: ["JavaScript", "HTML5", "CSS3", "React", "Vue.js", "TypeScript"]
          }
        ]
      },
      contact: {
        title: "📧 Contact Information",
        items: [
          {
            type: "Email",
            value: "tu@email.com",
            link: "mailto:tu@email.com"
          }
        ]
      },
      projects: {
        title: "🚀 Projects",
        items: [
          {
            name: "E-commerce Platform",
            description: "Full-stack e-commerce solution with React frontend and Node.js backend",
            technologies: ["React", "Node.js", "MongoDB", "Stripe"],
            link: "https://github.com/tuusuario/ecommerce-platform"
          }
        ]
      }
    };
  }

  printLine(text = "") {
    const line = document.createElement('div');
    line.textContent = text;
    this.terminal.appendChild(line);
    this.terminal.scrollTop = this.terminal.scrollHeight;
    return line;
  }

  wait(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  async typeText(text, speed = 40) {
    const line = this.printLine();
    for (let i = 0; i < text.length; i++) {
      line.textContent += text[i];
      await this.wait(speed);
    }
    return line;
  }

  async loadingBar(modules = ["profile.js", "experience.json", "skills.ai"]) {
    for (const mod of modules) {
      const line = this.printLine(`Loading module ${mod} [          ]`);
      let bar = '';
      for (let i = 0; i <= 10; i++) {
        bar = '='.repeat(i) + ' '.repeat(10 - i);
        line.textContent = `Loading module ${mod} [${bar}]`;
        await this.wait(80);
      }
      line.textContent += " -> Done";
      await this.wait(300);
    }
  }

  createPrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'prompt';
    prompt.innerHTML = `<span>$</span><input id="input" autofocus />`;
    this.terminal.appendChild(prompt);
    const input = prompt.querySelector('input');
    input.focus();

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        this.executeCommand(cmd);
        input.disabled = true;
        this.createPrompt();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigateHistory('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.navigateHistory('down');
      }
    });
  }

  navigateHistory(direction) {
    const input = document.querySelector('#input');
    if (direction === 'up' && this.historyIndex < this.commandHistory.length - 1) {
      this.historyIndex++;
      input.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
    } else if (direction === 'down' && this.historyIndex > 0) {
      this.historyIndex--;
      input.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
    } else if (direction === 'down' && this.historyIndex === 0) {
      this.historyIndex = -1;
      input.value = '';
    }
  }

  executeCommand(cmd) {
    if (cmd) {
      this.commandHistory.push(cmd);
      this.historyIndex = -1;
    }

    this.printLine(`$ ${cmd}`);
    
    const result = this.getCommandResult(cmd);
    if (result) {
      this.printLine(result);
    }
  }

  getCommandResult(cmd) {
    const commands = {
      help: () => this.formatHelp(),
      whoami: () => this.formatWhoami(),
      education: () => this.formatEducation(),
      experience: () => this.formatExperience(),
      skills: () => this.formatSkills(),
      contact: () => this.formatContact(),
      projects: () => this.formatProjects(),
      clear: () => {
        this.terminal.innerHTML = '';
        this.startBootSequence();
        return '';
      }
    };

    return commands[cmd] 
      ? commands[cmd]()
      : `'${cmd}' is not a recognized command. Type 'help' to see valid options.`;
  }

  formatHelp() {
    const data = this.data.help;
    let output = `${data.title}\n`;
    data.commands.forEach(cmd => {
      output += `  ${cmd}\n`;
    });
    output += `\n${data.description}`;
    return output;
  }

  formatWhoami() {
    const data = this.data.whoami;
    let output = `${data.ascii_art}\n\n`;
    output += `[+] USERNAME: ${data.user.username}\n`;
    output += `[+] NAME    : ${data.user.name}\n`;
    output += `[+] ROLE    : ${data.user.role}\n`;
    output += `[+] STATUS  : ${data.user.status}\n`;
    output += `[+] LOCATION: ${data.user.location}\n`;
    output += `[+] AGE     : ${data.user.age}\n\n`;

    if (data.certifications) {
      output += `[~] CERTIFICATIONS:\n`;
      data.certifications.forEach(cert => {
        output += `    - ${cert}\n`;
      });
      output += `\n`;
    }

    output += `[~] INTERESTS:\n`;
    data.interests.forEach(interest => {
      output += `    - ${interest}\n`;
    });
    output += `\n`;

    output += `[~] LANGUAGES:\n`;
    data.languages.forEach(language => {
      output += `    - ${language}\n`;
    });
    output += `\n`;

    output += `[~] ABOUT:\n    ${data.description}\n`;
    return output;
  }

  formatEducation() {
    const data = this.data.education;
    let output = `${data.title}\n`;
    data.items.forEach(item => {
      output += `\n${item.degree}\n`;
      output += `  Institution: ${item.institution}\n`;
      output += `  Period: ${item.period}\n`;
      output += `  Description: ${item.description}\n`;
    });
    return output;
  }

  formatExperience() {
    const data = this.data.experience;
    let output = `${data.title}\n`;
    data.items.forEach(item => {
      output += `\n${item.position}\n`;
      output += `  Company: ${item.company}\n`;
      output += `  Period: ${item.period}\n`;
      output += `  Description: ${item.description}\n`;
    });
    return output;
  }

  formatSkills() {
    const data = this.data.skills;
    let output = `${data.title}\n`;
    data.categories.forEach(category => {
      output += `\n${category.name}:\n`;
      category.skills.forEach(skill => {
        output += `  • ${skill}\n`;
      });
    });
    return output;
  }

  formatContact() {
    const data = this.data.contact;
    let output = `${data.title}\n`;
    data.items.forEach(item => {
      output += `\n${item.type}:\n`;
      output += `  ${item.value}\n`;
      if (item.link) {
        output += `  Link: ${item.link}\n`;
      }
    });
    return output;
  }

  formatProjects() {
    const data = this.data.projects;
    let output = `${data.title}\n`;
    data.items.forEach(project => {
      output += `\n${project.name}\n`;
      output += `  Description: ${project.description}\n`;
      output += `  Technologies: ${project.technologies.join(', ')}\n`;
      if (project.link) {
        output += `  Link: ${project.link}\n`;
      }
    });
    return output;
  }

  async startBootSequence() {
    this.printLine(); // spacer
    await this.typeText("Initializing interactive resume assistant...");
    await this.wait(300);
    await this.loadingBar();
    await this.wait(400);
    await this.typeText("Welcome to cv.sh");
    await this.wait(300);
    await this.typeText("Typing 'help' automatically...");
    await this.wait(500);
    
    const helpOutput = this.getCommandResult('help');
    this.printLine(`$ help`);
    this.printLine(helpOutput);
    
    this.createPrompt();
  }
}

// Initialize terminal when page loads
window.onload = () => {
  new Terminal();
}; 