// Modern Mini Social Frontend with enhanced UX
const API_ROOT = '';

// State
let currentUser = null;
let currentSection = 'feed';

// Helper: get token
function getToken() {
  return localStorage.getItem('token');
}

// Helper: headers with auth
function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return headers;
}

// Helper: show toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'error' ? '#ff4757' : type === 'success' ? '#2ed573' : '#667eea'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    z-index: 2000;
    animation: slideInRight 0.3s ease;
  `;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Modal controls
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

document.querySelectorAll('.close').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.target.closest('.modal').style.display = 'none';
  });
});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) e.target.style.display = 'none';
});

// Navigation
document.getElementById('nav-feed').addEventListener('click', () => {
  currentSection = 'feed';
  updateNav();
  showSection('feed');
  loadFeed();
});

document.getElementById('nav-create').addEventListener('click', () => {
  if (!getToken()) { showToast('Please login first', 'error'); return; }
  currentSection = 'create';
  updateNav();
  showSection('create-post-section');
});

document.getElementById('nav-my-profile').addEventListener('click', () => {
  if (!getToken()) { showToast('Please login first', 'error'); return; }
  currentSection = 'profile';
  updateNav();
  showSection('my-profile-section');
  loadMyProfile();
});

function updateNav() {
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  if (currentSection === 'feed') document.getElementById('nav-feed').classList.add('active');
  else if (currentSection === 'create') document.getElementById('nav-create').classList.add('active');
  else if (currentSection === 'profile') document.getElementById('nav-my-profile').classList.add('active');
}

function showSection(sectionId) {
  document.getElementById('auth-section') && (document.getElementById('auth-section').style.display = 'none');
  document.getElementById('create-post-section').style.display = sectionId === 'create-post-section' ? 'block' : 'none';
  document.getElementById('feed').style.display = sectionId === 'feed' ? 'block' : 'none';
  document.getElementById('my-profile-section').style.display = sectionId === 'my-profile-section' ? 'block' : 'none';
}

// Auth Forms
document.getElementById('show-register').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'block';
});

document.getElementById('show-login').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('register-form').style.display = 'none';
});

// Login
document.getElementById('btn-login').addEventListener('click', async () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  if (!email || !password) { showToast('Please fill all fields', 'error'); return; }
  try {
    const res = await fetch(API_ROOT + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.message || 'Login failed', 'error'); return; }
    localStorage.setItem('token', data.token);
    currentUser = data.user;
    showToast('Welcome back! 👋', 'success');
    closeModal('auth-modal');
    renderAuth();
    loadFeed();
  } catch (err) { showToast('Error logging in', 'error'); }
});

// Register
document.getElementById('btn-register').addEventListener('click', async () => {
  const username = document.getElementById('reg-username').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  if (!username || !email || !password) { showToast('Please fill all fields', 'error'); return; }
  try {
    const res = await fetch(API_ROOT + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.message || 'Registration failed', 'error'); return; }
    localStorage.setItem('token', data.token);
    currentUser = data.user;
    showToast('Welcome to Mini Social! 🎉', 'success');
    closeModal('auth-modal');
    renderAuth();
    loadFeed();
  } catch (err) { showToast('Error registering', 'error'); }
});

// Create Post
document.getElementById('btn-create-post').addEventListener('click', async () => {
  const text = document.getElementById('post-text').value;
  const image = document.getElementById('post-image').value;
  if (!text.trim()) { showToast('Post cannot be empty', 'error'); return; }
  try {
    const res = await fetch(API_ROOT + '/posts/create', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ text, image })
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.message || 'Create failed', 'error'); return; }
    document.getElementById('post-text').value = '';
    document.getElementById('post-image').value = '';
    showToast('Post published! 🎉', 'success');
    currentSection = 'feed';
    updateNav();
    showSection('feed');
    loadFeed();
  } catch (err) { showToast('Error creating post', 'error'); }
});

// Load Feed
async function loadFeed() {
  document.getElementById('posts').innerHTML = '<div style="text-align:center; color:#999;">Loading posts...</div>';
  try {
    const res = await fetch(API_ROOT + '/posts', { headers: authHeaders() });
    const posts = await res.json();
    if (!res.ok) { document.getElementById('posts').innerText = 'Failed to load feed'; return; }
    renderPosts(posts);
  } catch (err) { document.getElementById('posts').innerText = 'Error loading feed'; }
}

// Render Posts
function renderPosts(posts) {
  const postsDiv = document.getElementById('posts');
  if (!posts || posts.length === 0) {
    postsDiv.innerHTML = '<div style="text-align:center; padding:40px; color:#999;">No posts yet. Be the first! ✍️</div>';
    return;
  }
  postsDiv.innerHTML = '';
  posts.forEach(p => {
    const liked = currentUser && p.likes.find(l => l === currentUser.id || l._id === currentUser.id);
    const userInitial = (p.userId?.username || 'U').charAt(0).toUpperCase();
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `
      <div class="post-header">
        <div class="post-avatar">${userInitial}</div>
        <div class="post-user-info">
          <strong class="post-user-name" style="cursor:pointer;">${escapeHtml(p.userId?.username || 'Unknown')}</strong>
          <div class="post-meta">${new Date(p.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
      <div class="post-text">${escapeHtml(p.text)}</div>
      ${p.image ? `<img src="${escapeHtml(p.image)}" class="post-image" alt="post">` : ''}
      <div class="post-actions">
        <button class="action-btn like-btn ${liked ? 'liked' : ''}" data-id="${p._id}">
          ${liked ? '❤️' : '🤍'} Like (${p.likes.length})
        </button>
        <button class="action-btn comment-btn" data-id="${p._id}">💬 Comments</button>
      </div>
      <div class="comments-panel" id="comments-${p._id}" style="display:none;"></div>
    `;
    postsDiv.appendChild(div);
    
    // User name click to view profile
    div.querySelector('.post-user-name').addEventListener('click', () => viewUserProfile(p.userId._id));
  });

  // Like buttons
  document.querySelectorAll('.like-btn').forEach(b => b.addEventListener('click', async (e) => {
    if (!getToken()) { showToast('Please login first', 'error'); return; }
    const id = e.target.closest('button').dataset.id;
    try {
      const res = await fetch(API_ROOT + `/posts/like/${id}`, {
        method: 'POST',
        headers: authHeaders()
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || 'Like failed', 'error'); return; }
      loadFeed();
    } catch (err) { showToast('Error liking post', 'error'); }
  }));

  // Comment buttons
  document.querySelectorAll('.comment-btn').forEach(b => b.addEventListener('click', async (e) => {
    const id = e.target.closest('button').dataset.id;
    const panel = document.getElementById('comments-' + id);
    if (panel.style.display === 'none') {
      panel.innerHTML = '<div style="text-align:center; color:#999;">Loading comments...</div>';
      try {
        const res = await fetch(API_ROOT + `/comments/${id}`);
        const comments = await res.json();
        let html = `<div style="margin-bottom: 8px; font-size: 12px; color: #999;">${comments.length} comment${comments.length !== 1 ? 's' : ''}</div>`;
        comments.forEach(c => {
          html += `<div class="comment"><strong class="comment-author">${escapeHtml(c.userId.username)}</strong><div class="comment-text">${escapeHtml(c.text)}</div></div>`;
        });
        if (getToken()) {
          html += `<div class="comment-form"><input placeholder="Add a comment..." id="c-${id}"><button class="btn-primary" id="btn-c-${id}" style="margin:0; padding:8px 12px;">Post</button></div>`;
        }
        panel.innerHTML = html;
        if (getToken()) {
          document.getElementById(`btn-c-${id}`).addEventListener('click', async () => {
            const text = document.getElementById(`c-${id}`).value;
            if (!text.trim()) { showToast('Comment cannot be empty', 'error'); return; }
            try {
              const r = await fetch(API_ROOT + '/comments/add', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ postId: id, text })
              });
              const d = await r.json();
              if (!r.ok) { showToast(d.message || 'Comment failed', 'error'); return; }
              showToast('Comment posted! 📝', 'success');
              panel.style.display = 'none';
              loadFeed();
            } catch (err) { showToast('Error posting comment', 'error'); }
          });
        }
      } catch (err) { panel.innerText = 'Failed to load comments'; }
      panel.style.display = 'block';
    } else {
      panel.style.display = 'none';
    }
  }));
}

// Load My Profile
async function loadMyProfile() {
  if (!currentUser) return;
  try {
    const res = await fetch(API_ROOT + `/users/${currentUser.id}`);
    const profile = await res.json();
    if (!res.ok) { document.getElementById('my-profile').innerText = 'Failed to load profile'; return; }
    const html = `
      <div style="text-align: center; padding: 20px;">
        <div style="width: 80px; height: 80px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold; margin-bottom: 15px;">
          ${(profile.username || 'U').charAt(0).toUpperCase()}
        </div>
        <h2 style="color: #667eea; margin: 10px 0;">${escapeHtml(profile.username)}</h2>
        <p style="color: #999; margin: 5px 0;">${escapeHtml(profile.email)}</p>
        <p style="color: #555; margin: 15px 0; font-size: 14px;">${escapeHtml(profile.bio) || 'No bio yet'}</p>
        <div style="display: flex; gap: 20px; justify-content: center; margin: 20px 0; font-size: 14px;">
          <div><strong>${profile.followersCount}</strong><br>Followers</div>
          <div><strong>${profile.followingCount}</strong><br>Following</div>
        </div>
        <button class="btn-secondary" id="btn-edit-profile">Edit Profile</button>
      </div>
    `;
    document.getElementById('my-profile').innerHTML = html;
    document.getElementById('btn-edit-profile').addEventListener('click', () => openEditProfileModal(profile));
  } catch (err) { document.getElementById('my-profile').innerText = 'Error loading profile'; }
}

// View User Profile
async function viewUserProfile(userId) {
  try {
    const res = await fetch(API_ROOT + `/users/${userId}`);
    const profile = await res.json();
    if (!res.ok) { showToast('User not found', 'error'); return; }
    const isMe = currentUser && currentUser.id === userId;
    const html = `
      <div style="text-align: center; padding: 20px;">
        <div style="width: 80px; height: 80px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold; margin-bottom: 15px;">
          ${(profile.username || 'U').charAt(0).toUpperCase()}
        </div>
        <h2 style="color: #667eea; margin: 10px 0;">${escapeHtml(profile.username)}</h2>
        <p style="color: #555; margin: 15px 0; font-size: 14px;">${escapeHtml(profile.bio) || 'No bio yet'}</p>
        <div style="display: flex; gap: 20px; justify-content: center; margin: 20px 0; font-size: 14px;">
          <div><strong>${profile.followersCount}</strong><br>Followers</div>
          <div><strong>${profile.followingCount}</strong><br>Following</div>
        </div>
        ${!isMe && getToken() ? `<button class="btn-primary" id="btn-follow">Follow</button>` : ''}
      </div>
    `;
    document.getElementById('profile-detail').innerHTML = html;
    if (!isMe && getToken()) {
      document.getElementById('btn-follow').addEventListener('click', async () => {
        try {
          const res = await fetch(API_ROOT + `/users/follow/${userId}`, {
            method: 'POST',
            headers: authHeaders()
          });
          const data = await res.json();
          if (!res.ok) { showToast(data.message || 'Follow failed', 'error'); return; }
          showToast('Following! 🎉', 'success');
          viewUserProfile(userId);
        } catch (err) { showToast('Error following user', 'error'); }
      });
    }
    openModal('profile-modal');
  } catch (err) { showToast('Error loading profile', 'error'); }
}

// Edit Profile Modal
function openEditProfileModal(profile) {
  const html = `
    <h2>Edit Profile</h2>
    <input id="edit-username" placeholder="Username" value="${escapeHtml(profile.username)}">
    <textarea id="edit-bio" placeholder="Bio" style="min-height: 80px;">${escapeHtml(profile.bio)}</textarea>
    <div style="display: flex; gap: 10px;">
      <button class="btn-primary" id="btn-save-profile" style="flex: 1;">Save Changes</button>
      <button class="btn-secondary" id="btn-cancel-edit" style="flex: 1;">Cancel</button>
    </div>
  `;
  document.getElementById('profile-detail').innerHTML = html;
  document.getElementById('btn-save-profile').addEventListener('click', async () => {
    const username = document.getElementById('edit-username').value;
    const bio = document.getElementById('edit-bio').value;
    try {
      const res = await fetch(API_ROOT + `/users/${currentUser.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ username, bio })
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || 'Update failed', 'error'); return; }
      showToast('Profile updated! ✅', 'success');
      currentUser = data;
      closeModal('profile-modal');
      loadMyProfile();
    } catch (err) { showToast('Error updating profile', 'error'); }
  });
  document.getElementById('btn-cancel-edit').addEventListener('click', () => closeModal('profile-modal'));
  openModal('profile-modal');
}

// Render Auth Controls
function renderAuth() {
  const authControls = document.getElementById('auth-controls');
  authControls.innerHTML = '';
  const token = getToken();
  if (token) {
    const div = document.createElement('div');
    div.style.cssText = 'text-align: center; padding-top: 10px; border-top: 1px solid #eee;';
    div.innerHTML = `
      <div style="color: #667eea; font-weight: 600; font-size: 14px; margin-bottom: 10px;">${escapeHtml(currentUser?.username || 'User')}</div>
      <button class="btn-danger" id="btn-logout" style="width: 100%;">Logout</button>
    `;
    authControls.appendChild(div);
    document.getElementById('btn-logout').addEventListener('click', () => {
      localStorage.removeItem('token');
      currentUser = null;
      showToast('Logged out 👋', 'success');
      renderAuth();
      currentSection = 'feed';
      updateNav();
      showSection('feed');
      openModal('auth-modal');
      loadFeed();
    });
    document.getElementById('create-post-section').style.display = 'block';
  } else {
    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.style.width = '100%';
    btn.innerText = 'Login';
    btn.addEventListener('click', () => openModal('auth-modal'));
    authControls.appendChild(btn);
  }
  updateHeaderUser();
}

// Update header
function updateHeaderUser() {
  const headerUser = document.getElementById('header-user');
  if (currentUser) {
    headerUser.innerText = `Logged in as ${currentUser.username}`;
  }
}

// Escape HTML
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[&<>"'`]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'})[m]);
}

// Initial Load
renderAuth();
loadFeed();
