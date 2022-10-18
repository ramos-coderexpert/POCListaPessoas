import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { Pessoa } from 'src/app/models/Pessoa';
import { PessoaService } from 'src/app/services/pessoaService';
import { ElementDialogComponent } from 'src/app/shared/element-dialog/element-dialog.component';
import * as signalR from '@microsoft/signalr';
import { NameDialogComponent } from 'src/app/shared/name-dialog/name-dialog.component';

interface Message {
  userName: string;
  text: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [PessoaService],
})
export class HomeComponent implements OnInit {
  @ViewChild(MatTable)
  table!: MatTable<any>;
  displayedColumns: string[] = ['pessoaId', 'nome', 'idade', 'sexo', 'action'];
  dataSource!: Pessoa[];
  messages: Message[] = [];
  messageControl = new FormControl('');
  userName!: string;
  connection = new signalR.HubConnectionBuilder()
    .withUrl('https://localhost:7029/chat')
    .build();

  constructor(
    public dialog: MatDialog,
    public chatDialog: MatDialog,
    public pessoaService: PessoaService
  ) {
    this.pessoaService.getPessoas().subscribe((data: Pessoa[]) => {
      this.dataSource = data;
    });

    this.openChatDialog();
  }

  ngOnInit(): void {}

  openChatDialog() {
    const chatDialogRef = this.chatDialog.open(NameDialogComponent, {
      width: '250px',
      data: this.userName,
      disableClose: true,
    });

    chatDialogRef.afterClosed().subscribe((result) => {
      this.userName = result;
      this.startConnection();
    });
  }

  startConnection() {
    this.connection.on('newMessage', (username: string, text: string) => {
      this.messages.push({
        text: text,
        userName: username,
      });
    });

    this.connection.start();
  }

  sendMessage() {
    this.connection
      .send('newMessage', this.userName, this.messageControl.value)
      .then(() => this.messageControl.setValue(''));
  }

  openDialog(pessoa: Pessoa | null): void {
    const dialogRef = this.dialog.open(ElementDialogComponent, {
      width: '250px',
      data:
        pessoa === null
          ? {
              pessoaId: 0,
              nome: '',
              idade: null,
              sexo: '',
            }
          : {
              pessoaId: pessoa.pessoaId,
              nome: pessoa.nome,
              idade: pessoa.idade,
              sexo: pessoa.sexo,
            },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        if (this.dataSource.map((p) => p.pessoaId).includes(result.pessoaId)) {
          this.pessoaService.editPessoa(result).subscribe((data: Pessoa) => {
            const index = this.dataSource.findIndex(
              (p) => p.pessoaId === data.pessoaId
            );
            this.dataSource[index] = data;
            this.table.renderRows();
          });
        } else {
          this.pessoaService.createPessoa(result).subscribe((data: Pessoa) => {
            this.pessoaService.getPessoas().subscribe((data: Pessoa[]) => {
              this.dataSource = data;
            });
          });
        }
      }
    });
  }

  editPessoa(pessoa: Pessoa): void {
    this.openDialog(pessoa);
  }

  deletePessoa(pessoaId: number): void {
    this.pessoaService.deletePessoa(pessoaId).subscribe(() => {
      this.dataSource = this.dataSource.filter((p) => p.pessoaId !== pessoaId);
    });
  }
}
