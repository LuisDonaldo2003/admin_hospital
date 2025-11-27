import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignRolesRoleFamilyComponent } from './assign-roles-role-family.component';

describe('AssignRolesRoleFamilyComponent', () => {
  let component: AssignRolesRoleFamilyComponent;
  let fixture: ComponentFixture<AssignRolesRoleFamilyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignRolesRoleFamilyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignRolesRoleFamilyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
