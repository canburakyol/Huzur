
import os

file_path = 'd:/Projem/src/index.css'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix #root
root_target = """#root {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100dvh;"""

root_replacement = """#root {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  /* Safe Area Support */
  padding-top: max(20px, env(safe-area-inset-top));
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  padding-left: max(20px, env(safe-area-inset-left));
  padding-right: max(20px, env(safe-area-inset-right));
  min-height: 100dvh;"""

if root_target in content:
    content = content.replace(root_target, root_replacement)
    print("Fixed #root")
else:
    print("Could not find #root target")

# Fix .bottom-nav
nav_target = """.bottom-nav {
  position: fixed;
  bottom: 50px;
  /* Space for AdMob banner (50px height) */
  inset-inline-start: 0;
  inset-inline-end: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  /* Daha belirgin sınır */
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-around;
  align-items: center;"""

nav_replacement = """.bottom-nav {
  position: fixed;
  bottom: 0;
  /* Safe Area Support for Bottom Nav */
  padding-bottom: env(safe-area-inset-bottom);
  height: calc(60px + env(safe-area-inset-bottom));
  inset-inline-start: 0;
  inset-inline-end: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  /* Daha belirgin sınır */
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-around;
  align-items: flex-start; /* Align to top to handle padding-bottom */
  padding-top: 12px;"""

if nav_target in content:
    content = content.replace(nav_target, nav_replacement)
    print("Fixed .bottom-nav")
else:
    print("Could not find .bottom-nav target")

# Fix .hamburger-fab
fab_target = """.hamburger-fab {
  position: fixed;
  bottom: 90px;
  inset-inline-end: 20px;"""

fab_replacement = """.hamburger-fab {
  position: fixed;
  /* Safe Area Support for FAB */
  bottom: calc(90px + env(safe-area-inset-bottom));
  inset-inline-end: 20px;"""

if fab_target in content:
    content = content.replace(fab_target, fab_replacement)
    print("Fixed .hamburger-fab")
else:
    print("Could not find .hamburger-fab target")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
