document.querySelectorAll('.tab-button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

document.querySelectorAll('.nested-tab-button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nested-tab-button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.nested-tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const tabId = btn.dataset.tab;
    document.getElementById(tabId).classList.add('active');
    loadCSV(`data/${tabId}.csv`, tabId);
  });
});