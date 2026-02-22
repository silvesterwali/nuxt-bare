export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession();

  if (!loggedIn.value) {
    return navigateTo("/login");
  }

  // Protect admin routes
  if (to.path.startsWith("/admin") && user.value?.role !== "admin") {
    return navigateTo("/");
  }
});
