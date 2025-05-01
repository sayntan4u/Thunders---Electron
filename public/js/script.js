$(document).ready(function () {
    // Check localStorage for sidebar state
    const sidebarState = localStorage.getItem('sidebarState');
    if (sidebarState === 'collapsed') {
        $('#sidebar').addClass('active');
        $("#content").css("margin-left", "80px");
    }else{
        $('#sidebar').removeClass('active');
        $("#content").css("margin-left", "250px");
    }

    // Sidebar toggle
    $('#sidebarCollapse').on('click', function () {
        
        $('#sidebar').toggleClass('active');
        $('#sidebar').hasClass('active') ?  $("#content").css("margin-left", "80px") :  $("#content").css("margin-left", "250px");
        // Save sidebar state to localStorage
        localStorage.setItem('sidebarState', $('#sidebar').hasClass('active') ? 'collapsed' : 'expanded');
    });

    // Logout Confirmation
    $('#confirmLogout').on('click', function() {
        // Here you would typically make an API call to logout
        window.location.href = '/login/logout';
    });


    
}); 