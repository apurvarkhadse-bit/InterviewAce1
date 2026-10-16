// Main Application Controller & Authentication Engine for InterviewAce

class InterviewAceApp {
  constructor() {
    this.currentUser = null;
    this.currentView = 'landingView';
    this.init();
  }

  init() {
    this.loadUserSession();
    this.initEventListeners();
    this.updateAuthUI();

    // Initialize sub-modules
    if (window.assessmentCenter) window.assessmentCenter.renderCatalog();
    if (window.companyVault) window.companyVault.renderVault();
    if (window.swocEngine) window.swocEngine.renderDefaultProfile();

    // Default route
    if (this.currentUser) {
      this.navigateTo('dashboardView');
    } else {
      this.navigateTo('landingView');
    }
  }

  loadUserSession() {
    try {
      const stored = localStorage.getItem('interviewace_session');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored session:', e);
      this.currentUser = null;
    }
  }

  saveUserSession(user) {
    this.currentUser = user;
    localStorage.setItem('interviewace_session', JSON.stringify(user));
    this.updateAuthUI();
  }

  clearUserSession() {
    this.currentUser = null;
    localStorage.removeItem('interviewace_session');
    this.updateAuthUI();
  }

  initEventListeners() {
    // Navigation buttons
    document.querySelectorAll('[data-target-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const viewId = e.currentTarget.getAttribute('data-target-view');
        this.navigateTo(viewId);
      });
    });

    // Auth trigger buttons
    const btnNavLogin = document.getElementById('btnNavLogin');
    const btnNavRegister = document.getElementById('btnNavRegister');
    const btnNavLogout = document.getElementById('btnNavLogout');
    const btnHeroGetStarted = document.getElementById('btnHeroGetStarted');
    const btnHeroSignIn = document.getElementById('btnHeroSignIn');

    if (btnNavLogin) btnNavLogin.addEventListener('click', () => this.openModal('loginModal'));
    if (btnNavRegister) btnNavRegister.addEventListener('click', () => this.openModal('registerModal'));
    if (btnHeroGetStarted) btnHeroGetStarted.addEventListener('click', () => {
      if (this.currentUser) {
        this.navigateTo('dashboardView');
      } else {
        this.openModal('registerModal');
      }
    });
    if (btnHeroSignIn) btnHeroSignIn.addEventListener('click', () => this.openModal('loginModal'));
    if (btnNavLogout) btnNavLogout.addEventListener('click', () => this.openModal('logoutModal'));

    // Modal close triggers
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.currentTarget.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    // Switch between login & register
    const linkGoToRegister = document.getElementById('linkGoToRegister');
    const linkGoToLogin = document.getElementById('linkGoToLogin');
    if (linkGoToRegister) linkGoToRegister.addEventListener('click', () => {
      this.closeModal('loginModal');
      this.openModal('registerModal');
    });
    if (linkGoToLogin) linkGoToLogin.addEventListener('click', () => {
      this.closeModal('registerModal');
      this.openModal('loginModal');
    });

    // Login Form Submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
          this.showToast('Please provide email and password', 'error');
          return;
        }

        // Mock auth success
        const branchMatch = email.includes('mech') ? 'mech' : (email.includes('hsc') ? 'hsc' : 'cs');
        const user = {
          name: email.split('@')[0].toUpperCase(),
          email,
          branch: branchMatch,
          branchName: branchMatch === 'mech' ? 'Mechanical' : (branchMatch === 'hsc' ? 'HSC / Foundational' : 'Computer Science'),
          role: 'Undergraduate Student',
          joinedDate: new Date().toLocaleDateString()
        };

        this.saveUserSession(user);
        this.closeModal('loginModal');
        this.navigateTo('dashboardView');
        this.showToast(`Welcome back, ${user.name}!`, 'success');
      });
    }

    // Register Form Submit
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const branch = document.querySelector('input[name="regBranch"]:checked')?.value || 'cs';
        const targetCompany = document.getElementById('regTargetCompany').value || 'TCS & IT Giants';

        if (!name || !email) {
          this.showToast('Please enter your full name and email.', 'error');
          return;
        }

        const branchNames = {
          cs: 'Computer Science / IT',
          devops: 'DevOps & Cloud Engineering',
          aiml: 'AI & Machine Learning',
          fullstack: 'Full Stack Web Engineering',
          entc: 'Electronics & Telecom',
          mech: 'Mechanical Engg',
          civil: 'Civil Engg',
          mgmt: 'Management',
          hsc: 'HSC / Foundational'
        };

        const newUser = {
          name,
          email,
          branch,
          branchName: branchNames[branch] || 'Undergraduate',
          targetCompany,
          role: 'Internship Aspirant',
          joinedDate: new Date().toLocaleDateString()
        };

        this.saveUserSession(newUser);
        this.closeModal('registerModal');
        this.navigateTo('dashboardView');
        this.showToast(`Account created! Welcome to InterviewAce, ${name}!`, 'success');
      });
    }

    // Confirm Logout Button
    const btnConfirmLogout = document.getElementById('btnConfirmLogout');
    if (btnConfirmLogout) {
      btnConfirmLogout.addEventListener('click', () => {
        this.clearUserSession();
        this.closeModal('logoutModal');
        this.navigateTo('landingView');
        this.showToast('You have been logged out successfully.', 'info');
      });
    }

    // Demo Login Fast Presets
    document.querySelectorAll('.btn-demo-login').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const branch = e.currentTarget.getAttribute('data-demo-branch');
        let demoUser;

        if (branch === 'devops') {
          demoUser = {
            name: 'Rohan Verma',
            email: 'rohan.devops@interviewace.ai',
            branch: 'devops',
            branchName: 'DevOps & Cloud Engineering',
            targetCompany: 'AWS, Red Hat & Google Cloud',
            role: 'Cloud / DevOps Intern',
            joinedDate: new Date().toLocaleDateString()
          };
        } else if (branch === 'aiml') {
          demoUser = {
            name: 'Priya Nair',
            email: 'priya.aiml@interviewace.ai',
            branch: 'aiml',
            branchName: 'AI & Machine Learning',
            targetCompany: 'OpenAI, Microsoft & NVIDIA',
            role: 'ML Research Intern',
            joinedDate: new Date().toLocaleDateString()
          };
        } else if (branch === 'fullstack') {
          demoUser = {
            name: 'Siddharth Sen',
            email: 'siddharth.fullstack@interviewace.ai',
            branch: 'fullstack',
            branchName: 'Full Stack Web Engineering',
            targetCompany: 'Uber, Stripe & Meta',
            role: 'Full Stack Engineer Intern',
            joinedDate: new Date().toLocaleDateString()
          };
        } else if (branch === 'mech') {
          demoUser = {
            name: 'Rahul Patil',
            email: 'rahul.mech@interviewace.ai',
            branch: 'mech',
            branchName: 'Mechanical Engineering',
            targetCompany: 'Tata Motors & L&T',
            role: 'Final Year Engg Student',
            joinedDate: new Date().toLocaleDateString()
          };
        } else if (branch === 'hsc') {
          demoUser = {
            name: 'Sneha Deshmukh',
            email: 'sneha.hsc@interviewace.ai',
            branch: 'hsc',
            branchName: 'HSC / Foundational Stream',
            targetCompany: 'Entry-Level Internship Program',
            role: 'HSC Passed / Intern Seeker',
            joinedDate: new Date().toLocaleDateString()
          };
        } else {
          demoUser = {
            name: 'Apurva Sharma',
            email: 'apurva.cs@interviewace.ai',
            branch: 'cs',
            branchName: 'Computer Science & IT',
            targetCompany: 'TCS & Amazon',
            role: 'B.Tech Undergrad',
            joinedDate: new Date().toLocaleDateString()
          };
        }

        this.saveUserSession(demoUser);
        this.closeModal('loginModal');
        this.closeModal('registerModal');
        this.navigateTo('dashboardView');
        this.showToast(`Logged in as ${demoUser.name} (${demoUser.branchName})`, 'success');
      });
    });
  }

  updateAuthUI() {
    const loggedOutNav = document.getElementById('navLoggedOutGroup');
    const loggedInNav = document.getElementById('navLoggedInGroup');
    const userProfileBadge = document.getElementById('userProfileBadge');
    const userDisplayName = document.getElementById('userDisplayName');
    const userStreamTag = document.getElementById('userStreamTag');
    const userAvatarCircle = document.getElementById('userAvatarCircle');
    const dashStudentName = document.getElementById('dashStudentName');
    const dashBranchBadge = document.getElementById('dashBranchBadge');

    if (this.currentUser) {
      if (loggedOutNav) loggedOutNav.style.display = 'none';
      if (loggedInNav) loggedInNav.style.display = 'flex';
      if (userProfileBadge) userProfileBadge.style.display = 'flex';

      const initials = this.currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      if (userDisplayName) userDisplayName.textContent = this.currentUser.name;
      if (userStreamTag) userStreamTag.textContent = this.currentUser.branchName;
      if (userAvatarCircle) userAvatarCircle.textContent = initials;
      if (dashStudentName) dashStudentName.textContent = this.currentUser.name;
      if (dashBranchBadge) dashBranchBadge.textContent = this.currentUser.branchName;

      // Update interview branch default
      if (window.mockInterviewStudio) {
        window.mockInterviewStudio.currentBranch = this.currentUser.branch;
        const bSelect = document.getElementById('interviewBranchSelect');
        if (bSelect) bSelect.value = this.currentUser.branch;
      }
    } else {
      if (loggedOutNav) loggedOutNav.style.display = 'flex';
      if (loggedInNav) loggedInNav.style.display = 'none';
      if (userProfileBadge) userProfileBadge.style.display = 'none';
    }
  }

  navigateTo(viewId) {
    // Protected views check
    const protectedViews = [
      'dashboardView', 'interviewStudio', 'codingStudioView', 'skillCenter',
      'companyVaultView', 'resumeBuilderView', 'driveTrackerView', 'roadmapsView',
      'swocView', 'learningHubView'
    ];
    if (protectedViews.includes(viewId) && !this.currentUser) {
      this.openModal('loginModal');
      this.showToast('Please Sign In to access your interview workspace.', 'info');
      return;
    }

    // Hide all views
    document.querySelectorAll('.view-section').forEach(view => {
      view.classList.remove('active');
    });

    // Show target view
    const targetEl = document.getElementById(viewId);
    if (targetEl) {
      targetEl.classList.add('active');
      this.currentView = viewId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update active nav button
    document.querySelectorAll('.nav-item-btn').forEach(btn => {
      if (btn.getAttribute('data-target-view') === viewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // View specific hooks
    if (viewId === 'interviewStudio' && window.mockInterviewStudio) {
      window.mockInterviewStudio.startSession(this.currentUser ? this.currentUser.branch : 'cs');
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new InterviewAceApp();
});
