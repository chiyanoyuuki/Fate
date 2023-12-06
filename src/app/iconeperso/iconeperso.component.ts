import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-iconeperso',
  templateUrl: './iconeperso.component.html',
  styleUrls: ['./iconeperso.component.scss']
})
export class IconepersoComponent implements OnInit 
{
  @Input() perso: any;
  @Input() titles: any = "notYetTitle";
  @Input() image: any;
  @Input() showTitle: any = false;

  constructor() { }

  ngOnInit(): void {
  }

}
