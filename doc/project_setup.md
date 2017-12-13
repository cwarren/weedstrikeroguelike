# Project Set Up

How to get started with your project.

### The Very Basics

1. Development tools needed:
  * editor - Atom : https://atom.io/
  * git & account on github
  * browser - Chrome preferred
1. on github create a repository for your project
  * use the default README.md that they offer
  * skip other defaults (e.g. a default .gitignore)
1. on your computer create a folder to hold your git projects
  * e.g. /gits
1. using a command-line-interface (e.g. terminal / shell), git clone your project into a sub-folder there
  * e.g. <br/>
      cd /gits<br/>
      git clone https://github.com/{your_github_username}/{your_project_repo_name}.git
1. open your project folder in Atom
1. create a new file at the root level of your project: .gitignore
  * add .DS_Store to the .gitignore file
  * add ASIDE* to the .gitignore file
  * save it
1. back at the command line add and commit your work
  1. cd /gits/{your_project_repo_name}
  1. git add .
  1. git commit -m "a short note describing the work"
1. get the work from you local repository back up to github
  1. git push origin master
  
### Basic Project Structure

