export function renderContact(user) {
    let initials = "U";
    if (user.displayName) {
        const nameParts = user.displayName.trim().split(" ");
        if (nameParts.length >= 2) {
            initials = nameParts[0][0].toUpperCase() + nameParts[1][0].toUpperCase();
        } else {
            initials = nameParts[0][0].toUpperCase() + (nameParts[0][1] || "").toUpperCase();
        }
    } else if (user.email) {
        initials = user.email[0].toUpperCase() + (user.email[1] || "").toUpperCase();
    } else if (user.isAnonymous) {
        initials = "GU";
    }
    return initials;
}