const GameState={
  xp:Number(localStorage.getItem("oasis_xp"))||0,
  level:Number(localStorage.getItem("oasis_level"))||1,
  completed:JSON.parse(localStorage.getItem("oasis_completed")||"[]"),
  badges:JSON.parse(localStorage.getItem("oasis_badges")||"[]"),
  inventory:JSON.parse(localStorage.getItem("oasis_inventory")||"{}"),
  purchases:JSON.parse(localStorage.getItem("oasis_purchases")||"[]"),
  save(){
    localStorage.setItem("oasis_xp",this.xp);
    localStorage.setItem("oasis_level",this.level);
    localStorage.setItem("oasis_completed",JSON.stringify(this.completed));
    localStorage.setItem("oasis_badges",JSON.stringify(this.badges));
    localStorage.setItem("oasis_inventory",JSON.stringify(this.inventory));
    localStorage.setItem("oasis_purchases",JSON.stringify(this.purchases));
  },
  addXP(amount){
    this.xp=Math.max(0,this.xp+amount);
    this.level=Math.min(8,Math.floor(this.xp/100)+1);
    this.save();
  },
  complete(id,badge){
    if(!this.completed.includes(id)){
      this.completed.push(id);
      if(badge&&!this.badges.includes(badge))this.badges.push(badge);
      this.save();
    }
  },
  count(id){return Number(this.inventory[id])||0;},
  addItem(id,amount=1){
    this.inventory[id]=this.count(id)+amount;
    this.save();
  },
  useItem(id){
    if(this.count(id)<1)return false;
    this.inventory[id]-=1;
    if(this.inventory[id]<=0)delete this.inventory[id];
    this.save();
    return true;
  },
  buy(item){
    if(!item||this.xp<item.price)return false;
    if(item.type==="cosmetic"&&this.count(item.id)>0)return false;
    this.xp-=item.price;
    if(item.type==="power")this.addItem(item.id,1);
    else this.inventory[item.id]=1;
    this.purchases.unshift({name:item.name,price:item.price,date:new Date().toLocaleDateString()});
    this.level=Math.min(8,Math.floor(this.xp/100)+1);
    this.save();
    return true;
  },
  reset(){
    this.xp=0;this.level=1;this.completed=[];this.badges=[];
    this.inventory={};this.purchases=[];
    this.save();
  }
};