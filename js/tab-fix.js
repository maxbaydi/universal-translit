// Исправление для вкладок Bootstrap
document.addEventListener('DOMContentLoaded', function() {
    // Исправление для вкладок
    const tabEls = document.querySelectorAll('button[data-bs-toggle="tab"]');
    
    tabEls.forEach(tabEl => {
        tabEl.addEventListener('shown.bs.tab', function (event) {
            // Скрыть все вкладки, кроме активной
            const targetId = event.target.getAttribute('data-bs-target');
            const target = document.querySelector(targetId);
            
            // Найти все tab-pane и скрыть неактивные
            document.querySelectorAll('.tab-pane').forEach(pane => {
                if (pane !== target) {
                    pane.classList.remove('show', 'active');
                }
            });
            
            // Показать активную вкладку
            target.classList.add('show', 'active');
        });
    });
    
    // Инициализация активной вкладки
    const activeTabEl = document.querySelector('button.nav-link.active[data-bs-toggle="tab"]');
    if (activeTabEl) {
        const targetId = activeTabEl.getAttribute('data-bs-target');
        const target = document.querySelector(targetId);
        
        // Скрыть все остальные вкладки
        document.querySelectorAll('.tab-pane').forEach(pane => {
            if (pane !== target) {
                pane.classList.remove('show', 'active');
            } else {
                pane.classList.add('show', 'active');
            }
        });
    }
});
