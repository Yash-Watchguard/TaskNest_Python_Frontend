import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserComponent } from './user.component';
import { person } from '../models/user.model';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let mockUser: person;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    mockUser = {
      Id: 'u-1',
      Name: 'Ravi',
      Email: 'USER#ravi@example.com',
      PhoneNumber: '9999999999',
      Role: 'Employee'
    };
    component.user = mockUser;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit user id when promoting employee', () => {
    spyOn(component.PromoteEmployeeSignal, 'emit');

    component.promoteemployee();

    expect(component.PromoteEmployeeSignal.emit).toHaveBeenCalledWith('u-1');
  });

  it('should emit delete signal and stop event propagation', () => {
    const event = jasmine.createSpyObj('event', ['stopPropagation']);
    spyOn(component.DeleteUserSignal, 'emit');

    component.deleteuser(event as unknown as Event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.DeleteUserSignal.emit).toHaveBeenCalled();
  });

  it('should emit user when opening task', () => {
    spyOn(component.opentask, 'emit');

    component.openTask();

    expect(component.opentask.emit).toHaveBeenCalledWith(mockUser);
  });
});
