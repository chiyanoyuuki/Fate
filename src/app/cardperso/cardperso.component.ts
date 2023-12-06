import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-cardperso',
  templateUrl: './cardperso.component.html',
  styleUrls: ['./cardperso.component.scss']
})
export class CardpersoComponent implements OnInit 
{
  @Input() perso: any;
  @Input() height: any = "normal";
  @Input() titles: any = "notYetTitle";
  @Input() grised: any = "colored";
  @Input() level: any = undefined;
  @Input() image: any;

  @Input() showBorder = true;
  @Input() showName = true;
  @Input() showClasse = true;
  @Input() showTitle = false;
  @Input() showQte = false;
  @Input() showLevel = false;

  public show = false;

  constructor() {}
  ngOnInit(): void {}
}
