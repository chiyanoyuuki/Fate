import DATA from '../assets/data.json';
import SUCC from '../assets/succes.json';

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { trigger,state,style,animate,transition } from '@angular/animations';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('video', [
      state('0', style({ transition:"unset", width:"0px", overflow:"hidden", transform: "scale(1)" })),
      state('1', style({ transition:"unset",  width:"305px", overflow:"hidden", transform: "scale(1)" })),
      state('2', style({ transition:"unset",  width:"305px", overflow:"unset", transform: "scale(1.2)" })),
      state('3', style({ transition:"unset",  width:"305px", overflow:"unset", transform: "scale(1)" })),
      transition('0 => 1', animate('2000ms ease-out')),
      transition('1 => 2', animate('500ms ease-out')),
      transition('2 => 3', animate('500ms ease-out')),
    ]),
    trigger('back', [
      state('0', style({ transition:"unset", height:"101%" })),
      state('1', style({ transition:"unset", height:"0%" })),
      transition('0 => 1', animate('2100ms ease-out')),
    ]),
    trigger('idle', [
      state('0', style({ transform: "translate(0px,0px)"})),
      state('1', style({ transform: "{{dest}}"}), {params: {dest: 'translate(0px,0px)'}}),
      transition('0 => 1', animate('400ms')),
      transition('1 => 0', animate('400ms'))
    ]),
  ]
})

export class AppComponent implements OnInit
{
  public devMode = environment.devMode;
  public classes = ["Alter Ego", "Archer", "Assassin","Avenger","Beast","Berserker","Caster","Foreigner","Lancer","Moon Cancer","Pretender","Rider","Ruler","Saber","Shielder"];
  //INTERVAL
  public mainInterval: any;
  public timeToRefresh: number;
  //SELECT
  public sqlGetUsers = "SELECT * FROM fate2_users";
  public sqlGetLastBanner = "SELECT * FROM fate2_banner ORDER BY maj DESC LIMIT 1";
  public sqlGetServants = "SELECT * FROM fate2_servants";
  public sqlGetTitle = "SELECT * FROM fate_title";
  public sqlGetLevels = "SELECT * FROM fate2_levels";
  public sqlGetSuccess = "SELECT * FROM fate2_success";
  public sqlGetShop = "SELECT * FROM fate2_shop";
  public sqlGetHistoPulls = "SELECT * FROM fate2_histopull";
  public sqlGetPvm = "SELECT * FROM fate2_pvm";
  //DATA
  public data: any = DATA;
  public titles: any = [];
  public levels: any = [];
  public bigCard:any;
  public shop:any = [];
  //CONNECTION
  public background: string = "connScreen";
  public page: string = "connect";
  public error: string = "";
  public user: any;
  public users: any;
  public cagnotte = 0;
  public servants: any = [];
  //BANNER
  public banner: any;
  public timeToChangeBanner: number = 0;
  //SUMMON
  public servantsToInvoq:any = [];
  public servantsInvoqued:any = [];
  public videoState = "0";
  public backState = "0";
  public videoInterval:any;
  public servantInvoquing:any;
  //FORMATIONS
  public formationFilters = ["Alter Ego", "Archer", "Assassin","Avenger","Beast","Berserker","Caster","Foreigner","Lancer","Moon Cancer","Pretender","Rider","Ruler","Saber","Shielder", "","Servants 5*","Servants 4*","First Titles","Titles","Doublons","","Originaux","Not Titled"];
  public filters: any = [];
  public filterSpec: any;
  public formationServants: any = [];
  public search: string = "";
  public changeAscension = false;
  //HEADER
  public successToClaim:any = [];
  public showSuccess = false;
  public showOptions = false;
  public musicSound = true;
  public allSound = true;
  //PROFILE
  public userProfile:any;
  public selectionPerso:any = undefined;
  public popup:any;
  //SHOP
  public createSell:any;
  //PVM
  public pvm:any;
  public idleInterval:any;
  public idleState:any = [];
  
  //SCALE DES PERSOS
  public i = 0;
  public perso:any;
  public team2:any = [];

  public ascensionActuelle = 0;
  public persos: any = [];
  public actions:any = ["Perso", "Ascension", "Taille","Décalage X","Décalage Y"];

  public bgmusic: any;
  public sonbtn: any;
  //BONUS
  public bonus: any = {};

  constructor(private http: HttpClient){}
  ngOnInit()
  {
    this.bgmusic = new Audio();
    this.bgmusic.src = "./assets/Chaldea.ogg";
    this.bgmusic.load();
    this.bgmusic.volume = 0.1;
    this.bgmusic.loop = true;

    this.sonbtn = new Audio();
    this.sonbtn.src = "./assets/confirm_button.mp3";
    this.sonbtn.load();
    this.sonbtn.volume = 0.5;

    this.bonus.timer = this.getBonus();
    /*this.persos.push(this.data.find((d:any)=>d.id==2));
    this.persos.push(this.data.find((d:any)=>d.id==11));
    this.persos.push(this.data.find((d:any)=>d.id==0));
    this.persos.push(this.data.find((d:any)=>d.id==75));
    this.persos.push(this.data.find((d:any)=>d.id==151));
    this.changePerso(); */
  }
  getBonus()
  {
    return Math.round(Math.random()*1000*60)+(1000*30);
  }
  clickBonus()
  {
    let val = 1;
    if(Math.round(Math.random()*100)==50)val = 10;
    else if(Math.round(Math.random()*1000)==500)val = 30;
    this.FATEset("UPDATE fate2_users SET quartz = quartz + 1 WHERE id="+this.user.id).subscribe((d:any)=>{
      this.bonus.life = -1;
      this.FATEget(this.sqlGetUsers).subscribe((users:any)=>{
        this.setUser(users);
      });
    });
  }
  changePerso()
  {
    this.ascensionActuelle = 0;
    this.perso = this.data[this.i];
    if(!this.perso.np)this.perso.np = {};
    if(!this.perso.decalageX)this.perso.decalageX = [0,0,0];
    if(!this.perso.decalageY)this.perso.decalageY = [0,0,0];
    if(!this.perso.taille)this.perso.taille = [0,0,0];
    this.persos[2] = this.perso;
  }
  getAsensionSprite(i:any)
  {
    if(i!=2)return this.persos[i].sprite1;
    let sprite = undefined;
    if(this.perso.sprite1&&this.ascensionActuelle==0)sprite = this.perso.sprite1;
    if(this.perso.sprite2&&this.ascensionActuelle==1)sprite = this.perso.sprite2;
    if(this.perso.sprite3&&this.ascensionActuelle==2)sprite = this.perso.sprite3;
    return sprite;
  }
  block(type:any,nb:any)
  {
    if(nb==0)
    {
      if(!type&&this.i==0)return true;
      if(type&&this.i==429)return true;
    }
    else if(nb==1)
    {
      if(!type&&this.ascensionActuelle==0)return true;
      if(type&&this.ascensionActuelle==2)return true;
    }
    return false;
  }
  setaction(type:any,nb:any)
  {
    if(nb==0)
    {
      type==false?this.i--:this.i++;
      if(this.i==385)this.i=390;
      if(this.i==389)this.i=384;
      this.changePerso();
    }
    else if(nb==1)
    {
      type==false?this.ascensionActuelle--:this.ascensionActuelle++;
    }
    else if(nb==2)
    {
      if(type) this.perso.taille[this.ascensionActuelle]+=10;
      else this.perso.taille[this.ascensionActuelle]-=10;
      if(this.ascensionActuelle==0)
      {
        if(type) this.perso.taille[1]+=10;
        else this.perso.taille[1]-=10;

        if(type) this.perso.taille[2]+=10;
        else this.perso.taille[2]-=10;
      }
    }
    else if(nb==3)
    {
      if(type) this.perso.decalageX[this.ascensionActuelle]+=10;
      else this.perso.decalageX[this.ascensionActuelle]-=10;
      if(this.ascensionActuelle==0)
      {
        if(type) this.perso.decalageX[1]+=10;
        else this.perso.decalageX[1]-=10;

        if(type) this.perso.decalageX[2]+=10;
        else this.perso.decalageX[2]-=10;
      }
    }
    else if(nb==4)
    {
      if(type) this.perso.decalageY[this.ascensionActuelle]+=10;
      else this.perso.decalageY[this.ascensionActuelle]-=10;
      if(this.ascensionActuelle==0)
      {
        if(type) this.perso.decalageY[1]+=10;
        else this.perso.decalageY[1]-=10;

        if(type) this.perso.decalageY[2]+=10;
        else this.perso.decalageY[2]-=10;
      }
    }
  }
  showData()
  {
    console.log(this.data);
  }
  getRdm(fois:any,plus:any){return Math.round(Math.random()*fois)+plus;}
  //REQUESTS
  public clearObject(a:any)
  {
    for(let cpt=0;cpt<20;cpt++)
    {
      delete a[cpt];
    }
  }
  show(){console.log(this.data);}
  public clear(a:any){a.forEach((b:any)=>this.clearObject(b));}
  public FATEget(req:any){return this.http.get<any>('https://www.chiya-no-yuuki.fr/FATEget?data='+req);}
  public FATEmultiple(req:any){return this.http.get<any>('https://www.chiya-no-yuuki.fr/FATEmultiple?data='+req);}
  public FATEset(req:any)
  {
    const dataToSend = {
      sql:req
    }
    return from(
      fetch(
        'https://www.chiya-no-yuuki.fr/FATEset',
        {
          body: JSON.stringify(dataToSend),
          headers: {'Content-Type': 'application/json',},
          method: 'POST',
          mode: 'no-cors',
        }
      )
    );
  }
  log(s: any)
  {
    if(this.devMode)console.log(s);
  }
  //CONNECTION
  connect(create:boolean,aftercreate:boolean)
  {
    let pseudo : any = document.getElementById('connect-pseudo');
    pseudo = pseudo.value;
    let mdp : any = document.getElementById('connect-mdp');
    mdp = mdp.value;

    if(!create)
    {
      this.FATEget(this.sqlGetUsers + " WHERE nom = '"+pseudo+"' AND mdp = '" + mdp + "'").subscribe((data:any)=>{
        this.clear(data);
        if(data[0])
        {
          this.user = data[0];
          this.background = "bgrecap";
          this.page = "banner";
          this.initData(true);
        }
        else if(!aftercreate){this.error = "Nom de compte ou mot de passe incorrect";}
        else {this.error = "Un compte existe déjà avec ce nom";}
      });
    }
    else
    {
      this.FATEset("INSERT INTO fate2_users (nom,mdp,servants,compo) VALUES ('"+pseudo+"','"+mdp+"','[]','[]')").subscribe((data:any)=>{
        this.connect(false,true);
      });
    }
  }
  initData(firstInit:any)
  {
    this.bgmusic.play();
    this.timeToRefresh = this.devMode?60000:30000;
    let date = new Date();
    this.log("Refresh Data : "+("0"+date.getHours()).slice(-2)+":"+("0"+date.getMinutes()).slice(-2)+":"+("0"+date.getSeconds()).slice(-2));
    this.FATEmultiple(
      "["
      + "\"" +  this.sqlGetUsers  + "\"" + ","
      + "\"" +  this.sqlGetLastBanner  + "\"" + ","
      + "\"" +  this.sqlGetServants  + " WHERE user_id = "+ this.user.id + "\"" + ","
      + "\"" +  this.sqlGetTitle + "\"" + ","
      + "\"" +  this.sqlGetLevels + "\"" + ","
      + "\"" +  this.sqlGetShop + "\"" + ","
      + "\"" +  this.sqlGetPvm + "\""
    + "]"
    ).subscribe((data:any)=>{
      this.setUser(data[0]);
      this.checkCagnotte();

      this.setBanner(data[1],firstInit);
      this.setServants(data[2]);

      this.titles = data[3];
      this.clear(this.titles);

      this.levels = data[4];
      this.clear(this.levels);

      this.setShop(data[5]);

      this.calcScore();
      this.checkSuccess();

      this.setPvm(data[6]);
      if(!this.mainInterval)this.startMainInterval();
    })
  }
  clickSound(type:string)
  {
    if(type=="all")
    {
      this.allSound = !this.allSound;
      if(!this.allSound)
      {
        
        this.bgmusic.volume=0;
        this.sonbtn.volume=0;
      }
      else
      {
        if(this.musicSound)this.bgmusic.volume=0.1;
        this.sonbtn.volume=0.5;
      }
    }
    else
    {
      this.musicSound = !this.musicSound;
      if(!this.allSound)return;
      if(!this.musicSound)
      {
        this.bgmusic.volume=0;
      }
      else
      {
        this.bgmusic.volume=0.1;
      }
    }
  }
  getServsFromIds(tab:any)
  {
    let tmp:any = [];
    tab = JSON.parse(tab);
    tab.forEach((s:any)=>{
      tmp.push(this.data.find((d:any)=>d.id==s));
    });
    return tmp;
  }
  setPvm(pvm:any)
  {
    this.pvm = pvm;
    this.clear(this.pvm);
    for(let i=0;i<this.pvm.length;i++)
    {
      let s = this.pvm[i];
      s.team = this.getServsFromIds(s.team);
      s.ascs = JSON.parse(s.ascs);
      s.levels = JSON.parse(s.levels);
    }
    console.log(this.pvm);
  }
  setShop(shop:any)
  {
    this.shop = shop;
    this.clear(this.shop);
    this.shop = shop.filter((s:any)=>s.bought_user_id == 0);
    for(let i=0;i<this.shop.length;i++)
    {
      let s = this.shop[i];
      s.propose_servants = this.getServsFromIds(s.propose_servants);
      s.propose_titles = this.getServsFromIds(s.propose_titles);
      s.propose_truetitles = this.getServsFromIds(s.propose_truetitles);
      s.price_servants = this.getServsFromIds(s.price_servants);
      s.price_titles = this.getServsFromIds(s.price_titles);
      s.price_truetitles = this.getServsFromIds(s.price_truetitles);
      if(i==this.shop.length-1)
      {
        let tmp = this.shop.filter((s:any)=>s.user_id==this.user.id);
        tmp.forEach((t:any)=>{
          if(this.cantsell(t))this.cancelsell(t);
        })
      }
    }
    
  }
  getUserName(userid:any)
  {
    return this.users.find((u:any)=>u.id==userid).nom;
  }
  setUser(users:any)
  {
    this.users = users;
    this.clear(this.users);
    this.users.forEach((u:any)=>{
      let serv = this.data.find((d:any)=>d.id==u.servant_id);
      u.servant = serv;
      u.servants = this.getServsFromIds(u.servants);
      u.compo = this.getServsFromIds(u.compo);
    });
    this.user = this.users.find((u:any)=>u.id==this.user.id);
    this.users.sort((a:any,b:any)=>b.score-a.score);
  }
  calcScore()
  {
    let serv = this.servants;
    let score = 0;
    serv.forEach((s:any)=>{
      let main = 0;
      let second = 0;
      if(s.nom!="Craft Essence")
      {
        if(s.level==5){main=100;second=50;}
        else if(s.level==4){main=50;second=25;}
        else if(s.level==3){main=9;second=3;}
        else if(s.level==2){main=9;second=3;}
        else if(s.level==1){main=9;second=3;}
        else if(s.level==0){main=1000;second=500;}
      }
      score += main;
      let qte = s.qte - 1;
      score += second * qte;
    })
    let actual = this.user.score;
    if(actual!=score)
      {
        this.FATEset("UPDATE fate2_users SET score="+score+" WHERE id="+this.user.id).subscribe((d:any)=>{
          this.FATEget(this.sqlGetUsers).subscribe((users:any)=>{
            this.setUser(users);
          });
        });
      }
  }
  checkSuccess()
  {
    this.FATEget(this.sqlGetSuccess+" WHERE user_id="+this.user.id).subscribe((data:any)=>{
      this.clear(data);
      this.successToClaim = [];

      let nbclasses: any[] = [];
      let nbclassesmax: any[] = [];
      this.classes.forEach((c:any)=>
      {
        nbclasses.push(this.servants.filter((u:any)=>u.classe==c).length);
        nbclassesmax.push(this.data.filter((u:any)=>u.classe==c).length);
      });
      let nb30 = this.levels.filter((d:any)=>d.user_id==this.user.id&&d.level>30).length;
      let nb60 = this.levels.filter((d:any)=>d.user_id==this.user.id&&d.level>60).length;
      let nb90 = this.levels.filter((d:any)=>d.user_id==this.user.id&&d.level>90).length;

      let nbservdiff = this.servants.filter((u:any)=>u.nom!="Craft Essence").length;
      let nb5diff = this.servants.filter((u:any)=>u.level==5&&u.nom!="Craft Essence").length;
      let nb4diff = this.servants.filter((u:any)=>u.level==4&&u.nom!="Craft Essence").length;
      let nbtot = 0;this.servants.forEach((d:any)=>{if(d.nom!="Craft Essence")nbtot+=d.qte});
      let nbtitlediff = this.titles.filter((t:any)=>t.user_id==this.user.id).length;
      let nbfirsttitlediff = this.titles.filter((t:any)=>t.user_id==this.user.id&&t.first==1).length;
    
      let id=0;
      let ind = 0;
      this.classes.forEach((classe:any)=>{
        this.addSuccess(id,data,nbclasses[ind]>0,"My first "+classe,"Obtenir son premier servant de classe "+classe,5);id++;
        this.addSuccess(id,data,nbclasses[ind]>4,"A little group of "+classe+"s","Obtenir 5 servants de classe "+classe,5);id++;
        this.addSuccess(id,data,nbclasses[ind]>9,"A bunch of "+classe+"s","Obtenir 10 servants de classe "+classe,5);id++;
        this.addSuccess(id,data,nbclasses[ind]>19,"An army of "+classe+"s","Obtenir 20 servants de classe "+classe,5);id++;
        this.addSuccess(id,data,nbclasses[ind]>29,"Plenty of "+classe+"s","Obtenir 30 servants de classe "+classe,5);id++;
        this.addSuccess(id,data,nbclasses[ind]>39,"A city of "+classe+"s","Obtenir 40 servants de classe "+classe,5);id++;
        this.addSuccess(id,data,nbclasses[ind]>49,"A world of "+classe+"s","Obtenir 50 servants de classe "+classe,5);id++;
        this.addSuccess(id,data,nbclasses[ind]==nbclassesmax[ind],"You got them all !","Obtenir tous les servants de classe "+classe,30);id++;
        ind++;
      });
      this.addSuccess(id,data,nb30>0,"More 30s","Obtenir une ascension sur 1 servant",5);id++;
      this.addSuccess(id,data,nb60>0,"More 60s","Avoir 1 servant au dessus du niveau 60",5);id++;
      this.addSuccess(id,data,nb90>0,"More 90s","Avoir 1 servant au niveau maximum",5);id++;
      this.addSuccess(id,data,nb30>4,"More 30s","Obtenir une ascension sur 5 servants",5);id++;
      this.addSuccess(id,data,nb60>4,"More 60s","Avoir 5 servants au dessus du niveau 60",5);id++;
      this.addSuccess(id,data,nb90>4,"More 90s","Avoir 5 servants au niveau maximum",5);id++;
      this.addSuccess(id,data,nb30>9,"More 30s","Obtenir une ascension sur 10 servants",5);id++;
      this.addSuccess(id,data,nb60>9,"More 60s","Avoir 10 servants au dessus du niveau 60",5);id++;
      this.addSuccess(id,data,nb90>9,"More 90s","Avoir 10 servants au niveau maximum",5);id++;
      this.addSuccess(id,data,nb30>19,"More 30s","Obtenir une ascension sur 20 servants",5);id++;
      this.addSuccess(id,data,nb60>19,"More 60s","Avoir 20 servants au dessus du niveau 60",5);id++;
      this.addSuccess(id,data,nb90>19,"More 90s","Avoir 20 servants au niveau maximum",5);id++;
      this.addSuccess(id,data,nb30>29,"More 30s","Obtenir une ascension sur 30 servants",5);id++;
      this.addSuccess(id,data,nb60>29,"More 60s","Avoir 30 servants au dessus du niveau 60",5);id++;
      this.addSuccess(id,data,nb90>29,"More 90s","Avoir 30 servants au niveau maximum",5);id++;
      this.addSuccess(id,data,nb30>39,"More 30s","Obtenir une ascension sur 40 servants",5);id++;
      this.addSuccess(id,data,nb60>39,"More 60s","Avoir 40 servants au dessus du niveau 60",5);id++;
      this.addSuccess(id,data,nb90>39,"More 90s","Avoir 40 servants au niveau maximum",5);id++;
      this.addSuccess(id,data,nb30>49,"More 30s","Obtenir une ascension sur 50 servants",5);id++;
      this.addSuccess(id,data,nb60>49,"More 60s","Avoir 50 servants au dessus du niveau 60",5);id++;
      this.addSuccess(id,data,nb90>49,"More 90s","Avoir 50 servants au niveau maximum",5);id++;

      let tmp = [0,4,9,19,29,39,49,59,69,79,89,99,109,119,129,139,149,159,169,179,189,199];
      tmp.forEach((t:any)=>{
        this.addSuccess(id,data,nbservdiff>t,"I want them all !",t==0?"Obtenir son premier servant":"Avoir "+(t+1)+" servants différents",5);id++;
        this.addSuccess(id,data,nb5diff>t,"Give me the rainbows",t==0?"Obtenir son premier servant 5*":"Avoir "+(t+1)+" servants 5* différents",5);id++;
        this.addSuccess(id,data,nb4diff>t,"Give me the golds",t==0?"Obtenir son premier servant 4*":"Avoir "+(t+1)+" servants 4* différents",5);id++;
        this.addSuccess(id,data,nbtitlediff>t,"Give me the shinys",t==0?"Obtenir son premier servant title":"Avoir "+(t+1)+" servants title différents",10);id++;
        this.addSuccess(id,data,nbfirsttitlediff>t,"First for the shinys",t==0?"Obtenir son premier servant title unique":"Avoir "+(t+1)+" servants title uniques différents",20);id++;
      });
      
      let tmp2 = [0,4,9,19,49,99,149,199,249,299,349,399,449,499,999,1499,1999,2999,3999,4999,9999];
      tmp2.forEach((t:any)=>{
        this.addSuccess(id,data,nbtot>t,"My army is growing",t==0?"Obtenir son tout premier servant":"Avoir "+(t+1)+" servants au total",5);id++;
      });
    });
  }
  addSuccess(id:any,data:any,cond:any,nom:any,desc:any,rec:any)
  {
    let succ = {id:id,nom:nom,desc:desc,recompense:rec};
    let tmp = data.find((d:any)=>d.id==id);
    if(!tmp)
    {
      if(cond)
      {
        this.FATEset("INSERT INTO fate2_success (id,user_id,claimed) VALUES ("+id+","+this.user.id+",0)");
        this.successToClaim.push(succ);
      }
    }
    else if(tmp.claimed==0)
    {
      this.successToClaim.push(succ);
    }
  }
  nbSuccess()
  {
    let tot = 0;
    this.successToClaim.forEach((s:any)=>{
      tot+=s.recompense;
    })
    return tot;
  }
  claimAll()
  {
    let rec = this.nbSuccess();
    this.showSuccess = false;
    this.successToClaim = [];
    this.FATEset("UPDATE fate2_success SET claimed = 1 where user_id="+this.user.id).subscribe((d:any)=>{
      this.FATEset("UPDATE fate2_users SET quartz = quartz + "+rec+" WHERE id="+this.user.id).subscribe((da:any)=>{
        this.FATEget(this.sqlGetUsers).subscribe((users:any)=>{
          this.setUser(users);
        });
      });
    });
  }
  setServants(servants:any)
  {
    this.servants = servants;
    this.clear(this.servants);
    this.servants = this.servants.map((s:any)=>{
      let tmp = this.data.find((y:any)=>y.id==s.servant_id);
      tmp.qte = s.qte;
      return tmp;
    });
    this.getFormationServants();
  }
  checkCagnotte()
  {
    let dateNow = new Date().getTime();
    let lastCagnotteDate = new Date(this.user.cagnotte).getTime();
    let minutes = Math.floor((dateNow-lastCagnotteDate)/60000);
    this.cagnotte = Math.floor(minutes/3);
    if(this.cagnotte>60)this.cagnotte = 60;
    else if(this.cagnotte<0)this.cagnotte = 0;
  }
  recupererCagnotte()
  {
    this.FATEset("UPDATE fate2_users SET quartz = quartz + "+this.cagnotte+", cagnotte = CURRENT_TIMESTAMP WHERE id = "+this.user.id).subscribe((data)=>{
      this.cagnotte=0;
      this.FATEget(this.sqlGetUsers).subscribe((users:any)=>{
        this.setUser(users);
        this.checkCagnotte();
      });
    });
  }
  startMainInterval()
  {
    this.log("Start main interval");
    this.mainInterval = setInterval(() => {
        this.timeToChangeBanner -= 1000;
        this.timeToRefresh -= 1000;
        this.bonus.timer -= 1000;
        this.bonus.life -= 1000;

        if(this.timeToChangeBanner<0){this.generateBanner(false);}
        if(this.timeToRefresh<0){this.initData(false);}
        if(this.bonus.timer<0){this.spawnBonus();}
    },1000);
  }
  spawnBonus()
  {
    this.sonbtn.play();
    this.bonus.timer=this.getBonus();
    this.bonus.life=8000;
    this.bonus.x = 5 + Math.round(Math.random()*90);
    this.bonus.y = 5 + Math.round(Math.random()*90);
  }
  //MENU
  clickMenu(menu:any)
  {
    this.sonbtn.play();
    if(this.page=='summon'||this.page==menu)return;
    
    if(menu=='pvm')this.initBattle();
    else this.stopIdleInterval();

    if(this.servants.length!=this.formationServants.length)this.getFormationServants();

    if(menu!="shop")this.createSell = undefined;
    this.selectionPerso = undefined;
    this.search = "";
    this.bigCard = undefined;
    this.filters = [];

    this.page = menu;
  }
  setBigCard(perso:any)
  {
    if(this.selectionPerso)
    {
      this.selectedPerso(perso);
      return;
    }
    this.changeAscension = false;
    this.bigCard = perso;
  }
  //BANNER
  getTimeToChangeBanner()
  {
    return ('0'+Math.floor(this.timeToChangeBanner/60000)).slice(-2)+
    ":"+
    ('0'+Math.floor((this.timeToChangeBanner%60000)/1000)).slice(-2);
  }
  checkWhenBannerchange(firstInit:any)
  {
    let lastBanner = new Date(this.banner.maj);
    let dateNow = new Date();
    let minutesNow = dateNow.getMinutes();
      this.timeToChangeBanner = 200000000;
      if(minutesNow<30)this.timeToChangeBanner = 30-minutesNow;
      else this.timeToChangeBanner = 60-minutesNow;
      this.timeToChangeBanner = this.timeToChangeBanner * 1000 * 60 - dateNow.getSeconds()*1000;
    if(firstInit&&dateNow.getTime()-lastBanner.getTime()>1000*60*30)
    {
      this.generateBanner(firstInit);
    }
  }
  idToServFromTab(tab:any)
  {
    tab = JSON.parse(tab);
    let tmp: any = [];
    tab.forEach((t:any)=>{
      tmp.push(this.idToServ(t));
    })
    return tmp;
  }
  idToServ(id:any)
  {
    return this.data.find((d:any)=>d.id==id);
  }
  generateBanner(firstInit:any)
  {
    this.log("Generate Banner");
    let boost5 = this.getRdmServId(this.data.filter((d:any)=>d.level==5&&d.nom!="Craft Essence"));
    let boost4 = this.getRdmServId(this.data.filter((d:any)=>d.level==4&&d.nom!="Craft Essence"));
    let boost5group:any = [];
    let boost4group:any = [];
    for(let i=0;i<10;i++){boost5group.push(this.getRdmServId(this.data.filter((d:any)=>d.level==5&&d.nom!="Craft Essence"&&!boost5group.includes(d.id)&&boost5!=d.id)));}
    for(let i=0;i<10;i++){boost4group.push(this.getRdmServId(this.data.filter((d:any)=>d.level==4&&d.nom!="Craft Essence"&&!boost4group.includes(d.id)&&boost4!=d.id)));}
    let nb = 0;
    if(firstInit)
    {
      let date = new Date();
      let minutesNow = date.getMinutes();
      if(minutesNow>30) nb = minutesNow-30;
      else nb = minutesNow;
    }
    this.FATEset("INSERT INTO fate2_banner(boost_5, boost_4, boost_5_group, boost_4_group,maj) SELECT "+boost5+","+boost4+",'["+boost5group+"]','["+boost4group+"]', CURRENT_TIMESTAMP - INTERVAL "+nb+" DAY_MINUTE FROM fate2_banner WHERE NOT EXISTS(SELECT * FROM fate2_banner WHERE (UNIX_TIMESTAMP(CURRENT_TIMESTAMP) - UNIX_TIMESTAMP(maj))/60 < 20 LIMIT 1) LIMIT 1").subscribe((data:any)=>{
      this.FATEget(this.sqlGetLastBanner).subscribe((banner:any)=>{
        this.setBanner(banner,false);
      });
    });
  }
  setBanner(banner:any,firstInit:any)
  {
    this.clear(banner);
    this.banner = banner[0];
    this.banner.boost_5 = this.data.find((d:any)=>d.id==this.banner.boost_5);
    this.banner.boost_4 = this.data.find((d:any)=>d.id==this.banner.boost_4);
    this.banner.boost_5_group = this.idToServFromTab(this.banner.boost_5_group);
    this.banner.boost_4_group = this.idToServFromTab(this.banner.boost_4_group);
    this.checkWhenBannerchange(firstInit);
  }
  getRdmServ(data:any)
  {
    let rdm = Math.floor(Math.random()*data.length);
    if(rdm==data.length)rdm=data.length-1;
    return data[rdm];
  }
  getRdmServId(data:any){return this.getRdmServ(data).id;}
  summon(nb:any)
  {
    this.servantsInvoqued = [];
    this.servantsToInvoq = [];
    this.FATEset("UPDATE fate2_users SET quartz = quartz - "+(3*nb)+" WHERE id = "+this.user.id).subscribe((users:any)=>{
      for(let i=0;i<nb;i++)
      {
        this.summonServ(i==nb-1);
      }
    });
  }
  summonServ(last:any)
  {
    let servant = this.getInvoq();
    this.servantsToInvoq.push(servant);
    if(this.servantsToInvoq.length==10){
      let pulls = this.servantsToInvoq.map(function(serv:any){return serv.id});
      this.FATEset("INSERT INTO fate2_histopull(user_id,pulls) VALUES("+this.user.id+",'"+JSON.stringify(pulls)+"')");
    }
    if(servant.nom!="Craft Essence")
    {
      let rdm = Math.round(Math.random()*50);
      this.log(servant.nom+" - "+"title:"+(rdm==25));
      if(servant.nom!="Craft Essence" && rdm==25)
      {
        this.FATEset("INSERT INTO fate_title(user_id, servant_id, first, qte) VALUES ("+this.user.id+","+servant.id+",NOT EXISTS(SELECT * FROM fate_title t2 WHERE t2.servant_id = "+servant.id+"),1)ON DUPLICATE KEY UPDATE qte = qte + 1").subscribe((d:any)=>{
          this.FATEget(this.sqlGetTitle).subscribe((data:any)=>{
            this.titles = data;
            this.clear(this.titles);
          })
        });
      }
    }
    else{this.log(servant.nom);}
    this.FATEset("INSERT INTO fate2_servants(user_id, servant_id, level, qte) VALUES ("+this.user.id+","+servant.id+","+servant.level+",1) ON DUPLICATE KEY UPDATE qte = qte + 1").subscribe((serv:any)=>{
      if(last)
      {
        this.FATEmultiple(
          "["
          + "\"" +  this.sqlGetUsers  + "\"" + ","
          + "\"" +  this.sqlGetServants  + " WHERE user_id = "+ this.user.id + "\"" + ","
          + "\"" +  this.sqlGetTitle + "\""
        + "]").subscribe((data:any)=>{
          this.setUser(data[0]);

          this.setServants(data[1]);

          this.titles = data[2];
          this.clear(this.titles);
          if(this.page!="summon")this.videosStart();
        })
      }
    });
  }
  getInvoq()
  {
    let rdm = Math.floor(Math.random()*10000);
    if(rdm==666){return this.data.filter((d:any)=>d.level==0&&d.nom!="Craft Essence");}
    else
    {
      rdm = Math.floor(Math.random()*100);
      if(rdm<2)
      {
        rdm = Math.floor(Math.random()*2);
        if(rdm==0){return this.banner.boost_5}
        else
        {
          rdm = Math.floor(Math.random()*2);
          if(rdm==0){return this.getRdmServ(this.banner.boost_5_group);}
          else return this.getRdmServ(this.data.filter((d:any)=>d.level==5&&d.nom!="Craft Essence"));
        }
      }
      else if(rdm<7)
      {
        rdm = Math.floor(Math.random()*2);
        if(rdm==0){return this.banner.boost_4;}
        else
        {
          rdm = Math.floor(Math.random()*2);
          if(rdm==0){return this.getRdmServ(this.banner.boost_4_group);}
          else return this.getRdmServ(this.data.filter((d:any)=>d.level==4&&d.nom!="Craft Essence"));
        }
      }
      else if(rdm<55){return this.getRdmServ(this.data.filter((d:any)=>d.level>0&&d.level<4&&d.nom!="Craft Essence"));}
      else if(rdm<61){return this.data.find((d:any)=>d.level==5&&d.nom=="Craft Essence");}
      else if(rdm<70){return this.data.find((d:any)=>d.level==4&&d.nom=="Craft Essence");}
      else{return this.getRdmServ(this.data.filter((d:any)=>d.level<4&&d.nom=="Craft Essence"));}
    }
  }
  videosStart()
  {
    clearInterval(this.videoInterval);
    this.backState = "0";
    this.videoState = "0";
    this.page = "summon";
    let video: any = document.getElementById("video1");
    let servant = this.servantsToInvoq[0];
    this.servantInvoquing = servant;
    this.servantsInvoqued.push(servant);
    let vid = "ce";
    if(servant.level==5&&servant.nom!="Craft Essence")vid = "rainbow";
    else if(servant.level==4&&servant.nom!="Craft Essence")vid = "gold";
    else if(servant.nom!="Craft Essence")vid = "3star";
    video.src = "./assets/videos/"+vid+".mp4";
    video.volume = 0;
    video.currentTime = 0;
    video.play();
    this.servantsToInvoq.splice(0,1);
    this.videoInterval = setInterval(() => {
      if(this.servantInvoquing.nom!="Craft Essence")
      {
        if(video.currentTime>14.2){this.videoState = "3";}
        else if(video.currentTime>13.7){this.videoState = "2";}
        else if(video.currentTime>10.4){this.backState = "1";}
        else if(video.currentTime>6.7){this.videoState = "1";}
      }
      else
      {
        if(video.currentTime>8.5){this.videoState = "3";}
        else if(video.currentTime>8){this.videoState = "2";}
        else if(video.currentTime>5.5){this.videoState = "1";}
      }
    },100);
  }
  passVideo()
  {
    let video: any = document.getElementById("video1");
    if(video)
    {
      let duration = video.duration;
      if(video.currentTime>0.5&&video.currentTime<duration-3)
      {
        this.backState = "1";
        this.videoState = "2";
        video.currentTime = duration-3;
      }
    }
  }
  videoEnd()
  {
    clearInterval(this.videoInterval);
    if(this.servantsToInvoq.length==0)
    {
      this.page="recap";
    }
    else
    {
      this.videosStart();
    }
  }
  getBack(){
    if(this.servantInvoquing.special)return "./assets/images/back/gspecial.jpg";
    if(!this.servantInvoquing)return "./assets/images/back/saber.png";
      let retour: string = "";
      if(this.servantInvoquing.level > 3)
      {
        retour += "g";
      }
      retour += this.servantInvoquing.classe;
      retour = retour.toLowerCase();
      retour = retour.replace(/ /g,"");
      return "./assets/images/back/" + retour + ".png";
  }
  //FORMATION
  haveServant(perso:any)
  {
    return this.servants.find((s:any)=>s.id==perso.id)?"colored":"grised2";
  }
  getTitles(user:any,perso:any)
  {
    let tmp = this.titles.filter((t:any)=>t.servant_id==perso.id);
    let me = tmp.filter((t:any)=>t.user_id==user.id);
    if(me[0])
    {
      if(me[0].first==1) return "firstTitle";
      else return "title";
    }
    else
    {
      if(tmp.length==0) return "notYetTitle";
      else return "someoneTitle";
    }
  }
  getLevel(perso:any)
  {
    let tmp = this.levels.find((l:any)=>l.user_id==this.user.id&&l.servant_id==perso.id);
    return tmp;
  }
  addFilter(filter:any)
  {
    if(filter=="")return;
    if(this.classes.includes(filter))
    {
      if(this.filters.includes(filter))this.filters.splice(this.filters.indexOf(filter),1);
      else this.filters.push(filter);
    }
    else this.filterSpec==filter?this.filterSpec=undefined:this.filterSpec = filter;
    this.getFormationServants();
  }
  getFormationServants()
  {
    this.formationServants = [];
    this.formationServants = this.servants.filter((s:any)=>s.nom!="Craft Essence");
    let mytitles = this.titles.filter((t:any)=>t.user_id==this.user.id);
    
    if(this.createSell&&this.selectionPerso)
    {
      this.formationServants = this.servants;
      if(this.selectionPerso.type=="propose_servant")
      {
        this.formationServants = this.formationServants.filter((f:any)=>!this.createSell.propose_servants.find((p:any)=>p.id==f.id));
      }
      if(this.selectionPerso.type=="propose_title")
      {
        let titles = mytitles.filter((t:any)=>t.first==0||(t.first==1&&t.qte>1));
        this.formationServants = this.data.filter((d:any)=>titles.find((t:any)=>t.servant_id==d.id));
        this.formationServants = this.formationServants.filter((f:any)=>!this.createSell.propose_titles.find((p:any)=>p.id==f.id));
      }
      else if(this.selectionPerso.type=="propose_truetitle")
      {
        let titles = mytitles.filter((t:any)=>t.first==1);
        this.formationServants = this.data.filter((d:any)=>titles.find((t:any)=>t.servant_id==d.id));
        this.formationServants = this.formationServants.filter((f:any)=>!this.createSell.propose_truetitles.find((p:any)=>p.id==f.id));
      }
      else if(this.selectionPerso.type=="price_servant")
      {
        this.formationServants=this.data;
        this.formationServants = this.formationServants.filter((f:any)=>!this.createSell.price_servants.find((p:any)=>p.id==f.id));
      }
      else if(this.selectionPerso.type=="price_title")
      {
        this.formationServants=this.data.filter((d:any)=>d.level>3&&d.nom!="Craft Essence");
        this.formationServants = this.formationServants.filter((f:any)=>!this.createSell.price_titles.find((p:any)=>p.id==f.id));
      }
      else if(this.selectionPerso.type=="price_truetitle")
      {
        this.formationServants=this.data.filter((d:any)=>d.level>3&&d.nom!="Craft Essence");
        this.formationServants = this.formationServants.filter((f:any)=>!this.createSell.price_truetitles.find((p:any)=>p.id==f.id));
      }
    }
    else if(this.selectionPerso&&this.selectionPerso.page=="profile")
    {
      this.formationServants = this.servants.filter((s:any)=>s.nom!="Craft Essence");
      let tmp = this.data.filter((d:any)=>mytitles.find((t:any)=>t.servant_id==d.id));
      tmp.forEach((t:any)=>{if(!this.formationServants.includes(t))this.formationServants.push(t);})
    }
    else
    {
      if(this.filterSpec=="Servants 5*"){this.formationServants = this.formationServants.filter((f:any)=>f.level==5);}
      else if(this.filterSpec=="Servants 4*"){this.formationServants = this.formationServants.filter((f:any)=>f.level==4);}
      else if(this.filterSpec=="First Titles"){
        let titles = mytitles.filter((t:any)=>t.first==1);
        this.formationServants = this.data.filter((d:any)=>titles.find((t:any)=>t.servant_id==d.id));
      }
      else if(this.filterSpec=="Titles"){
        let titles = mytitles.filter((t:any)=>t.first==0||(t.first==1&&t.qte>1));
        this.formationServants = this.data.filter((d:any)=>titles.find((t:any)=>t.servant_id==d.id));
      }
      else if(this.filterSpec=="Doublons"){this.formationServants = this.formationServants.filter((f:any)=>f.qte>1);}
      else if(this.filterSpec=="Originaux"){this.formationServants = this.data.filter((f:any)=>f.special);}
      else if(this.filterSpec=="Not Titled"){this.formationServants = this.data.filter((d:any)=>!this.servants.find((s:any)=>d.id==s.id)).filter((f:any)=>!this.titles.find((t:any)=>t.servant_id==f.id));}
    }

    if(this.filters.length>0){
      this.formationServants = this.formationServants.filter((f:any)=>this.filters.includes(f.classe));
    }

    if(this.search!="")
    {
      let regexp = new RegExp('.*'+this.search.toLowerCase()+'.*');
      this.formationServants = this.formationServants.filter((d:any)=>d.nom.toLowerCase().match(regexp));
    }

    this.sorting(this.formationServants);
  }
  sorting(data:any)
  {
    data.sort((a: any,b: any) => 
    {
      if(b.level>a.level)
      {
        return 1;
      }
      else if(b.level<a.level)
      {
        return -1;
      }
      else
      {
        return a.nom > b.nom;
      }
    });
  }
  //BIGCARD
  useTitle()
  {
    let title = "Master of ";
    if(this.getTitles(this.user,this.bigCard)=="firstTitle")title = "True "+title;
    this.FATEset("UPDATE fate2_users SET title = '"+title+this.bigCard.nom+"' WHERE id="+this.user.id).subscribe((data)=>{
      this.FATEget(this.sqlGetUsers).subscribe((users:any)=>{
        this.setUser(users);
      })
    });
  }
  gotTitle()
  {
    return this.titles.find((t:any)=>t.user_id==this.user.id&&t.servant_id==this.bigCard.id)||this.servants.find((s:any)=>s.id==this.bigCard.id&&s.level<4&&s.nom!="Craft Essence");
  }
  getTrueMaster()
  {
    let tmp = this.titles.find((t:any)=>t.servant_id==this.bigCard.id&&t.first==1);
    return tmp?this.users.find((u:any)=>u.id==tmp.user_id).nom:"Not yet Titled";
  }
  getCELeft()
  {
    let tmp = this.servants.filter((s:any)=>s.nom=="Craft Essence");
    let somme = 0;
    tmp.forEach((t:any)=>somme += t.level * t.qte);
    return somme;
  }
  gotServant(perso:any)
  {
    return this.servants.find((s:any)=>s.id==perso.id);
  }
  getLevelServant(id:any, servantid:any)
  {
    return this.levels.find((l:any)=>l.user_id==id&&l.servant_id==servantid);
  }
  getMaxPersoLvl()
  {
    let perso = this.getLevelServant(this.user.id,this.bigCard.id);
    let ce = this.getCELeft();
    if(perso)
    {
      if(perso.level<30) return (ce+perso.level>=30?30:ce+perso.level);
      else if(perso.level<60) return ce+perso.level>=60?60:ce+perso.level;
      else if(perso.level<90) return ce+perso.level>=90?90:ce+perso.level;
      else if(perso.level<100) return ce+perso.level>=100?100:ce+perso.level;
    }
    else
    {
      return (ce>=30?30:ce);
    }
  }
  getXpButtonText()
  {
    let perso = this.getLevelServant(this.user.id,this.bigCard.id);
    let ce = this.getCELeft();
    let max = this.getMaxPersoLvl();
    if(perso)
    {
      if(perso.level<30) return "XP to " + max + " (" + ce + ")";
      else if(perso.level==30) return "Ascend";
      else if(perso.level<60) return "XP to " + max + " (" + ce + ")";
      else if(perso.level==60) return "Ascend";
      else if(perso.level<90) return "XP to " + max + " (" + ce + ")";
      else if(perso.level==90) return "Ascend";
      else if(perso.level<100) return "XP to " + max + " (" + ce + ")";
      else return "Lvl max reached";
    }
    else
    {
      return "XP to " + max + " (" + ce + ")";
    }
  }
  xpServ()
  {
    let perso = this.getLevelServant(this.user.id,this.bigCard.id);
    let realmax = this.getMaxPersoLvl();
    let max = realmax;
    if(perso)perso.level = max;
    else{this.levels.push({user_id:this.user.id,servant_id:this.bigCard.id,level:max,ascension:0})}
    if(perso)max = max-perso.level;
    let tmp = this.servants.filter((s:any)=>s.nom=="Craft Essence");
    let CEuse = [0,0,0,0,0];
    let cpt=5;
    while(max>0)
    {
      if(cpt<=0)
      {
        max = 0;
      }
      else
      {
        let ce = tmp.find((t:any)=>t.level==cpt);
        if(ce)
        {
          let qte = ce.qte;
          let div = Math.floor(max/cpt);
          if(div>=qte)
          {
            CEuse[cpt-1] = qte;
            max = max - qte*cpt;
          }
          else if(div>0)
          {
            CEuse[cpt-1] = div;
            max = max - div*cpt;
          }
        }
        cpt = cpt - 1;
      }
    }
    let sql = "";
    if(!perso)sql = "INSERT INTO fate2_levels(user_id,servant_id,level,ascension) VALUES ("+this.user.id+","+this.bigCard.id+","+realmax+",0)";
    else sql = "UPDATE fate2_levels SET level="+realmax+" WHERE user_id="+this.user.id+" AND servant_id="+this.bigCard.id;
    this.FATEset(sql).subscribe((data:any)=>{
      for(let i=0;i<5;i++)
      {
        let c = CEuse[i];
        if(c>0)
        {
          let ce = tmp.find((t:any)=>t.level==(i+1));
          let sql2 = "";
          if(ce.qte>c)sql2 = "UPDATE fate2_servants SET qte = qte-"+c+" WHERE user_id="+this.user.id+" AND servant_id="+ce.id;
          else sql2 = "DELETE FROM fate2_servants WHERE user_id="+this.user.id+" AND servant_id="+ce.id;
          this.FATEset(sql2);
        }
      }
      let int = setInterval(() => {
        this.FATEmultiple(
          "["
          + "\"" +  this.sqlGetServants  + " WHERE user_id = "+ this.user.id + "\"" + ","
          + "\"" +  this.sqlGetLevels + "\""
        + "]").subscribe((data:any)=>{
          this.setServants(data[0]);
          this.levels = data[1];
          this.clear(this.levels);
        })
        clearInterval(int);
      },1000);
    })
  }
  ascend()
  {
    let perso = this.getLevelServant(this.user.id,this.bigCard.id);
    let level = 31;
    let asc = 1;
    if(perso.level==60){ asc = 2; level = 61;}
    else if(perso.level==90) { asc = 3; level = 91;}
    this.FATEset("UPDATE fate2_levels SET level="+level+", ascension="+asc+" WHERE user_id="+this.user.id+" AND servant_id="+this.bigCard.id).subscribe((data:any)=>{
      this.FATEset("UPDATE fate2_servants SET qte = qte-1 WHERE user_id="+this.user.id+" AND servant_id="+this.bigCard.id).subscribe((d:any)=>{
        this.FATEmultiple(
          "["
          + "\"" +  this.sqlGetServants  + " WHERE user_id = "+ this.user.id + "\"" + ","
          + "\"" +  this.sqlGetLevels + "\""
        + "]").subscribe((data:any)=>{
          this.setServants(data[0]);
          this.levels = data[1];
          this.clear(this.levels);
        })
      });
    });
  }
  getImg(id:any,perso:any)
  {
    let tmp = this.getLevelServant(id,perso.id);
    let img = perso.img1;
    if(tmp)
    {
      if(tmp.ascension==1&&perso.img2)img = perso.img2;
      else if(tmp.ascension==2&&perso.img3)img = perso.img3;
      else if(tmp.ascension==3&&perso.img4)img = perso.img4;
    }
    return img;
  }
  getSprite(id:any,perso:any)
  {
    let tmp = this.getLevelServant(id,perso.id);
    let img = perso.sprite1;
    if(tmp)
    {
      if(tmp.ascension==1&&perso.sprite2)img = perso.sprite2;
      else if(tmp.ascension==2&&perso.sprite3)img = perso.sprite3;
      else if(tmp.ascension==3&&perso.sprite3)img = perso.sprite3;
    }
    return img;
  }
  changeAsc(i:any)
  {
    this.FATEset("UPDATE fate2_levels SET ascension = "+i+" WHERE user_id="+this.user.id+" AND servant_id="+this.bigCard.id).subscribe((data:any)=>{
      this.FATEget(this.sqlGetLevels).subscribe((levels:any)=>
      {
        this.changeAscension = false;
        this.levels = levels;
        this.clear(this.levels);
      });
    })
  }
  //PROFILE
  clickProfile(user:any)
  {
    this.userProfile = user;
    this.clickMenu("profile");
  }
  userHasTitle(user:any,servant:any)
  {
    let tmp = this.titles.find((t:any)=>t.user_id==user.id&&t.servant_id==servant.id);
    if(tmp)
    {
      if(tmp.first==1)return "firsttitle";
      else return "title";
    }
    else return "notitle"
  }
  clickChangePerso(type:any,i:any,page:any)
  {
    this.selectionPerso = {type:type,i:i,page:page};
    this.getFormationServants();
    this.page = "formation";
  }
  selectedPerso(perso:any)
  {
    if(this.selectionPerso.page=="shop"){this.selectedPersoShop(perso);return;}
    this.page=this.selectionPerso.page;
    let type = this.selectionPerso.type;
    let i = this.selectionPerso.i;
    if(type=="bigserv")
    {
      this.FATEset("UPDATE fate2_users SET servant_id="+perso.id+" WHERE id="+this.user.id).subscribe((d:any)=>{
        this.FATEget(this.sqlGetUsers).subscribe((users:any)=>{
          this.setUser(users);
          this.userProfile = this.users.find((u:any)=>u.id==this.userProfile.id);
        });
      });
    }
    else if(type=="botserv")
    {
      if(this.user.servants[i]&&perso.id==this.user.servants[i].id)return;
      let alreadyIn = this.user.servants.find((serv:any)=>serv.id==perso.id);

      if(this.user.servants.length<10)
      {
        if(alreadyIn)
        {
          if(this.user.servants[i])
          {
            let i2 = this.user.servants.indexOf(perso);
            let id2 = this.user.servants[i];
            
            this.user.servants[i] = perso;
            this.user.servants[i2] = id2;
          }
          else this.user.servants.splice(this.user.servants.indexOf(perso),1);
        }
        else if(this.user.servants[i])this.user.servants[i]=perso;
        else this.user.servants.push(perso);
      }
      else
      {
        if(alreadyIn)
        {
          let i2 = this.user.servants.indexOf(perso);
          let id2 = this.user.servants[i];
          
          this.user.servants[i] = perso;
          this.user.servants[i2] = id2;
        }
        else
        {
          this.user.servants[i] = perso;
        }
      }
      let tmp:any = [];
      this.user.servants.forEach((s:any)=>{tmp.push(s.id?s.id:s);});
      this.FATEset("UPDATE fate2_users SET servants='"+JSON.stringify(tmp)+"' WHERE id="+this.user.id).subscribe((d:any)=>{
        this.FATEget(this.sqlGetUsers).subscribe((users:any)=>{
          this.setUser(users);
          this.userProfile = this.users.find((u:any)=>u.id==this.userProfile.id);
        });
      });
    }
    else if(type=="compo")
    {
      if(this.user.compo[i]&&perso.id==this.user.compo[i].id)return;
      let alreadyIn = this.user.compo.find((serv:any)=>serv.id==perso.id);

      if(this.user.compo.length<10)
      {
        if(alreadyIn)
        {
          if(this.user.compo[i])
          {
            let i2 = this.user.compo.indexOf(perso);
            let id2 = this.user.compo[i];
            
            this.user.compo[i] = perso;
            this.user.compo[i2] = id2;
          }
          else this.user.compo.splice(this.user.compo.indexOf(perso),1);
        }
        else if(this.user.compo[i])this.user.compo[i]=perso;
        else this.user.compo.push(perso);
      }
      else
      {
        if(alreadyIn)
        {
          let i2 = this.user.compo.indexOf(perso);
          let id2 = this.user.compo[i];
          
          this.user.compo[i] = perso;
          this.user.compo[i2] = id2;
        }
        else
        {
          this.user.compo[i] = perso;
        }
      }
      let tmp:any = [];
      this.user.compo.forEach((s:any)=>{tmp.push(s.id?s.id:s);});
      this.FATEset("UPDATE fate2_users SET compo='"+JSON.stringify(tmp)+"' WHERE id="+this.user.id).subscribe((d:any)=>{
        this.FATEget(this.sqlGetUsers).subscribe((users:any)=>{
          this.setUser(users);
          this.userProfile = this.users.find((u:any)=>u.id==this.userProfile.id);
        });
      });
    }
  }
  createPopup(type:any,data:any)
  {
    if(type=="histopulls")
    {
      this.FATEget(this.sqlGetHistoPulls+" WHERE user_id="+this.userProfile.id+" ORDER BY date DESC").subscribe((pulls)=>{
        this.clear(pulls);
        for(let i=0;i<pulls.length;i++)
        {
          let s = pulls[i];
          s.pulls = this.getServsFromIds(s.pulls);
          if(i==pulls.length-1)
          {
            this.popup = {type:type,data:pulls};
          }
        }
      });
    }
    else
    {
      this.popup = {type:type,data:data};
    }
  }
  //SHOP
  cantbuy(vente:any)
  {
    if(vente.bought_user_id!=0)return true;
    if(this.user.quartz<vente.price_quartz)return true;
    let ok = false;
    vente.price_servants.forEach((p:any)=>{if(!this.servants.find((s:any)=>s.id==p.id))ok=true;});
    if(ok)return true;
    let mytitles = this.titles.filter((t:any)=>t.user_id==this.user.id);
    let titles = mytitles.filter((t:any)=>t.first==0||(t.first==1&&t.qte>1));
    vente.price_titles.forEach((p:any)=>{if(!titles.find((t:any)=>t.servant_id==p.id))ok=true;});
    if(ok)return true;
    let firsttitles = mytitles.filter((t:any)=>t.first==1);
    vente.price_truetitles.forEach((p:any)=>{if(!firsttitles.find((t:any)=>t.servant_id==p.id))ok=true;});
    return ok;
  }
  clickCreateSell()
  {
    if(this.createSell){this.createSell=undefined;return;}
    this.createSell = {
      user_id:this.user.id,
      propose_quartz:0,
      propose_servants:[],
      propose_titles:[],
      propose_truetitles:[],
      price_quartz:0,
      price_servants:[],
      price_titles:[],
      price_truetitles:[]
    }
  }
  createVente()
  {
    this.FATEmultiple(
      "["
      + "\"" +  this.sqlGetUsers  + "\"" + ","
      + "\"" +  this.sqlGetServants  + " WHERE user_id = "+ this.user.id + "\"" + ","
      + "\"" +  this.sqlGetTitle + "\"" + ","
      + "\"" +  this.sqlGetShop + "\""
    + "]"
    ).subscribe((data:any)=>{
      this.setUser(data[0]);
      this.setServants(data[1]);
      this.titles = data[2];
      this.clear(this.titles);
      this.setShop(data[3]);
      if(!this.cantsell(this.createSell))
      {
        let propose_servants = this.createSell.propose_servants.map(function(serv:any){return serv.id});
        let propose_titles = this.createSell.propose_titles.map(function(serv:any){return serv.id});
        let propose_truetitles = this.createSell.propose_truetitles.map(function(serv:any){return serv.id});
        let price_servants = this.createSell.price_servants.map(function(serv:any){return serv.id});
        let price_titles = this.createSell.price_titles.map(function(serv:any){return serv.id});
        let price_truetitles = this.createSell.price_truetitles.map(function(serv:any){return serv.id});

        this.FATEset("INSERT INTO fate2_shop "+
        "(user_id,propose_quartz,propose_servants,propose_titles,propose_truetitles,price_quartz,price_servants,price_titles,price_truetitles) " +
        "VALUES ("+
        this.user.id+
        ","+parseInt(this.createSell.propose_quartz)+
        ",'"+JSON.stringify(propose_servants)+
        "','"+JSON.stringify(propose_titles)+
        "','"+JSON.stringify(propose_truetitles)+
        "',"+parseInt(this.createSell.price_quartz)+
        ",'"+JSON.stringify(price_servants)+
        "','"+JSON.stringify(price_titles)+
        "','"+JSON.stringify(price_truetitles)+
        "')"
        ).subscribe((d:any)=>{
          this.FATEget(this.sqlGetShop).subscribe((shops:any)=>{
            this.setShop(shops);
            this.createSell = undefined;
            this.selectionPerso = undefined;
          });
        });
      }
    })
  }
  selectedPersoShop(perso:any)
  {
    this.page=this.selectionPerso.page;
    let type = this.selectionPerso.type;
    if(type=="propose_servant"){this.createSell.propose_servants.push(perso);}
    else if(type=="propose_title"){this.createSell.propose_titles.push(perso);}
    else if(type=="propose_truetitle"){this.createSell.propose_truetitles.push(perso);}
    else if(type=="price_servant"){this.createSell.price_servants.push(perso);}
    else if(type=="price_title"){this.createSell.price_titles.push(perso);}
    else if(type=="price_truetitle"){this.createSell.price_truetitles.push(perso);}
  }
  removeSell(type:any,i:any)
  {
    if(type=="propose_servant"){this.createSell.propose_servants.splice(i,1);}
    else if(type=="propose_title"){this.createSell.propose_titles.splice(i,1);}
    else if(type=="propose_truetitle"){this.createSell.propose_truetitles.splice(i,1);}
    else if(type=="price_servant"){this.createSell.price_servants.splice(i,1);}
    else if(type=="price_title"){this.createSell.price_titles.splice(i,1);}
    else if(type=="price_truetitle"){this.createSell.price_truetitles.splice(i,1);}
  }
  getShops()
  {
    let shops = this.shop;

    if(this.search!="")
    {
      let regexp = new RegExp('.*'+this.search.toLowerCase()+'.*');
      shops = shops.filter((s:any)=>this.getUserName(s.user_id).toLowerCase().match(regexp));
    }

    return shops; 
  }
  cantsell(sell:any)
  {
    if(this.user.quartz<sell.propose_quartz)return true;
    let ok = false;
    sell.propose_servants.forEach((p:any)=>{if(!this.servants.find((s:any)=>s.id==p.id))ok=true;});
    if(ok)return true;
    let mytitles = this.titles.filter((t:any)=>t.user_id==this.user.id);
    let titles = mytitles.filter((t:any)=>t.first==0||(t.first==1&&t.qte>1));
    sell.propose_titles.forEach((p:any)=>{if(!titles.find((t:any)=>t.servant_id==p.id))ok=true;});
    if(ok)return true;
    let firsttitles = mytitles.filter((t:any)=>t.first==1);
    sell.propose_truetitles.forEach((p:any)=>{if(!firsttitles.find((t:any)=>t.servant_id==p.id))ok=true;});
    return ok;
  }
  cancelsell(vente:any)
  {
    this.FATEset("DELETE FROM fate2_shop WHERE id="+vente.id).subscribe((d:any)=>{
          this.FATEget(this.sqlGetShop).subscribe((shops:any)=>{
            this.setShop(shops);
          });
        });
  }
  buysell(vente:any)
  {
    this.FATEmultiple(
      "["
      + "\"" +  this.sqlGetUsers  + "\"" + ","
      + "\"" +  this.sqlGetServants  + " WHERE user_id = "+ this.user.id + "\"" + ","
      + "\"" +  this.sqlGetTitle + "\"" + ","
      + "\"" +  this.sqlGetShop + "\""
    + "]"
    ).subscribe((data:any)=>{
      this.setUser(data[0]);
      this.setServants(data[1]);
      this.titles = data[2];
      this.clear(this.titles);
      this.setShop(data[3]);
      vente = data[3].find((v:any)=>v.id==vente.id);
      if(!this.cantbuy(vente))
      {
        this.FATEset("UPDATE fate2_shop SET bought_user_id="+this.user.id+" WHERE id="+vente.id).subscribe((d:any)=>{
          this.FATEmultiple(
            "["
            + "\"" +  this.sqlGetUsers  + "\"" + ","
            + "\"" +  this.sqlGetServants  + " WHERE user_id = "+ this.user.id + "\"" + ","
            + "\"" +  this.sqlGetTitle + "\"" + ","
            + "\"" +  this.sqlGetShop + "\""
          + "]"
          ).subscribe((data:any)=>{
            this.setUser(data[0]);
            this.setServants(data[1]);
            this.titles = data[2];
            this.clear(this.titles);
            this.setShop(data[3]);
          });
        });
        this.managesell(vente,'prop');
        this.managesell(vente,'price');
      }
    });
  }
  managesell(vente:any,type:any)
  {
    let userid = vente.user_id;
    let boughtuserid = this.user.id;
    let quartz = vente.propose_quartz;
    let servants = vente.propose_servants;
    let titles = vente.propose_titles;
    let truetitles = vente.propose_truetitles;
    
    if(type=="price")
    {
      userid = this.user.id;
      boughtuserid = vente.user_id;
      quartz = vente.price_quartz;
      servants = vente.price_servants;
      titles = vente.price_titles;
      truetitles = vente.price_truetitles;
    }

    if(quartz>0)
    {
      this.FATEset("UPDATE fate2_users SET quartz=quartz-"+quartz+" WHERE id="+userid);
      this.FATEset("UPDATE fate2_users SET quartz=quartz+"+quartz+" WHERE id="+boughtuserid);
    }

    if(servants.length>0)
    {
      for(let i=0;i<servants.length;i++)
      {
        let s = servants[i];
        this.FATEset("UPDATE fate2_servants SET qte=qte-1 WHERE servant_id="+s.id+" AND user_id="+userid).subscribe((d:any)=>{
          if(i==servants.length-1)
          {
            this.FATEset("DELETE FROM fate2_servants WHERE qte<=0").subscribe((d:any)=>{
              this.FATEget(this.sqlGetServants).subscribe((servants:any)=>{
                this.setServants(servants);
              })
            });
          }
        });
        this.FATEset("INSERT INTO fate2_servants(user_id, servant_id, level, qte) VALUES ("+boughtuserid+","+s.id+","+s.level+",1) ON DUPLICATE KEY UPDATE qte = qte + 1");
      }
    }
    if(titles.length>0)
    {
      for(let i=0;i<titles.length;i++)
      {
        let s = titles[i];
        this.FATEset("UPDATE fate_title SET qte=qte-1 WHERE servant_id="+s.id+" AND user_id="+userid).subscribe((d:any)=>{
          if(i==titles.length-1)
          {
            this.FATEset("DELETE FROM fate_title WHERE qte<=0").subscribe((d:any)=>{
              this.FATEget(this.sqlGetTitle).subscribe((titles:any)=>{
                this.titles = titles;
                this.clear(this.titles);
              })
            })
          }
        });
        this.FATEset("INSERT INTO fate_title(user_id, servant_id, first, qte) VALUES ("+boughtuserid+","+s.id+",0,1) ON DUPLICATE KEY UPDATE qte = qte + 1");
      }
    }
    if(truetitles.length>0)
    {
      for(let i=0;i<truetitles.length;i++)
      {
        let s = truetitles[i];
        this.FATEset("UPDATE fate_title SET qte=qte-1, first=0 WHERE servant_id="+s.id+" AND user_id="+userid).subscribe((d:any)=>{
          if(i==servants.length-1)
          {
            this.FATEset("DELETE FROM fate_title WHERE qte<=0").subscribe((d:any)=>{
              this.FATEget(this.sqlGetTitle).subscribe((titles:any)=>{
                this.titles = titles;
                this.clear(this.titles);
              })
            });
          }
        });
        this.FATEset("INSERT INTO fate_title(user_id, servant_id, first, qte) VALUES ("+boughtuserid+","+s.id+",1,1) ON DUPLICATE KEY UPDATE qte = qte + 1, first=1");
      }
    }
  }
  initBattle()
  {
    this.team2 = [];
    let tmp = this.pvm[this.user.pvm_easy];
    tmp.team.forEach((t:any)=>this.team2.push(t));
  
    for(let i=0;i<10;i++)
    {
      this.idleState.push({timing:Math.round(Math.random()*15)*100+400,state:"0",value:undefined});
    }


    this.idleInterval = setInterval(() => {
      for(let i=0;i<10;i++)
      {
        this.idleState[i].timing=this.idleState[i].timing-100;
        if(this.idleState[i].timing==0){this.idleState[i].value="translate("+this.getRdm(5,0)+"px,"+this.getRdm(2,0)+"px)";this.idleState[i].state="1";}
        if(this.idleState[i].timing<-500){this.idleState[i].state="0";this.idleState[i].timing=Math.round(Math.random()*15)*100+400;}
      }
    },100);
  }
  stopIdleInterval()
  {
    clearInterval(this.idleInterval);
  }
}
