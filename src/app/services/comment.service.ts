import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { comment, viewallcommentrespinse } from "../models/comment.model";
import { BehaviorSubject, map, tap } from "rxjs";

@Injectable({ providedIn: 'root' })
export class CommentService{
    private httpClient = inject(HttpClient);
  private commentobject = new BehaviorSubject<comment[]>([]);
  public comments$ = this.commentobject.asObservable();
  private getcommenturl=''

   baseUrl= 'http://127.0.0.1:8000/'
  baseUrl2= 'http://127.0.0.1:8000/'

  GetComments(url:string){
    this.getcommenturl=url;
    return this.httpClient.get<viewallcommentrespinse>(this.baseUrl+url)
    .pipe(
        map((response)=>{
            return response.data.map((t)=>({
                 comment_id:t.comment_id,
                 created_by:t.created_by,
                 content:t.content
            }) as comment)
        }),
        tap((tasks)=>{
            this.commentobject.next(tasks);
        })
    );
  }

  Addcomment(url:string, comment:string , ManagerId:string){
    return this.httpClient.post(this.baseUrl+url.replace('/:','/'),{
        "content":comment,
        "manager_id":ManagerId
    })
    .pipe(tap(response=>{
        this.GetComments(this.getcommenturl).subscribe()
    }))
  }
}