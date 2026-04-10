import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import {
  FORM_FIELD_CONTROL,
  IFormFieldControl,
} from '@app/shared/ui-kit/form-field/tokens/form-field-control.token';
import { FORM_FIELD } from '@app/shared/ui-kit/form-field/tokens/form-field.token';
import { Subject } from 'rxjs';

export interface ISelectOption<T = string> {
  value: T;
  label: string;
}

let nextId = 0;

const DROPDOWN_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
];

@Component({
  selector: 'ui-kit-select',
  imports: [CdkConnectedOverlay, CdkOverlayOrigin],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  providers: [{ provide: FORM_FIELD_CONTROL, useExisting: SelectComponent }],
  host: {
    '[class.ui-kit-select--open]': 'isOpen()',
    '[class.ui-kit-select--in-field]': 'isInField',
    '[class.ui-kit-select--error]': 'isErrorState',
  },
})
export class SelectComponent<T = string> implements IFormFieldControl, OnInit, OnDestroy {
  public readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly formField = inject(FORM_FIELD, { optional: true });
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  public readonly options = input<ISelectOption<T>[]>([]);
  public readonly value = model<T | null>(null);
  protected readonly _placeholder = input<string>('Выбрать...', { alias: 'placeholder' });

  public readonly stateChanges = new Subject<void>();
  public isFocused = false;

  protected readonly isOpen = signal(false);
  protected readonly positions = DROPDOWN_POSITIONS;
  protected readonly triggerWidth = signal(0);

  protected readonly selectedLabel = computed(
    () => this.options().find(option => option.value === this.value())?.label ?? '',
  );
  protected readonly isEmptySignal = computed(
    () => this.value() === null || this.value() === undefined,
  );

  private readonly _id = `ui-kit-select-${nextId++}`;

  public get id(): string {
    return this._id;
  }

  public get placeholder(): string {
    return this._placeholder();
  }

  public get isEmpty(): boolean {
    return this.value() === null || this.value() === undefined;
  }

  public get isDisabled(): boolean {
    return false;
  }

  public get isErrorState(): boolean {
    return !!(this.ngControl?.invalid && this.ngControl?.touched);
  }

  public get isInField(): boolean {
    return !!this.formField;
  }

  public ngOnInit(): void {
    this.formField?.registerControl(this);
  }

  public ngOnDestroy(): void {
    this.stateChanges.complete();
  }

  protected toggleDropdown(): void {
    this.triggerWidth.set(this.elementRef.nativeElement.offsetWidth);
    this.isOpen.update(open => !open);
    this.isFocused = this.isOpen();
    this.stateChanges.next();
  }

  protected selectOption(option: ISelectOption<T>): void {
    this.value.set(option.value);
    this.isOpen.set(false);
    this.isFocused = false;
    this.stateChanges.next();
  }

  protected close(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.isFocused = false;
      this.stateChanges.next();
    }
  }
}
