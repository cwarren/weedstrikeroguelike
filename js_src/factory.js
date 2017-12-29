export class Factory {
  constructor(factoryName,productClass) {
    this.name = factoryName;
    this.productClass = productClass;
    this.templates = {};
  }
  
  learn(template) {
    if (! template.name) {
      console.log("factory requires a name in a template it's trying to learn");
      console.dir(template);
      return false;
    }
    this.templates[template.name] = template;
  }
  
  // the existingId is used during persistence restores
  create(templateName, existingId) {
    let t = this.templates[templateName];
    if (! t) { 
      console.log(`Factory ${this.name} does not have any temple by name of ${templateName}`);
      return false;
    }
    if (existingId) {
      t = JSON.parse(JSON.stringify(t)); // avoid clobbering the original template
      t.existingId = existingId;
    }
    return new this.productClass(t);
  }
}