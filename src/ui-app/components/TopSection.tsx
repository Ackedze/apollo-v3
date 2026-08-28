import React, { useEffect, useRef, useState } from 'react';
import type { GenerationExampleCaptureRequest, PageTypeId } from '../types';
import { Button } from './Button';
import { GenerationExampleModal } from './GenerationExampleModal';
import { OptionList } from './OptionList';
import { OptionListCell } from './OptionListCell';
import { OptionListHeader } from './OptionListHeader';
import { PickerButton } from './PickerButton';
import {
  FlashIcon,
  PickerAndroidIcon,
  PickerAppleIcon,
  PickerDisplayIcon,
  PickerMobilePhoneIcon,
  SettingsIcon,
} from './PickerIcons';
import styles from './TopSection.module.css';

type TopSectionProps = {
  title: string;
  pageTypeId: PageTypeId | null;
  channelId: string;
  pickerLabel: string;
  actionLabel: string;
  actionDisabled: boolean;
  actionLoading: boolean;
  actionType: 'primary' | 'secondary';
  compact: boolean;
  shellAuditEnabled: boolean;
  showExpectedCustomizations: boolean;
  hideCustomizations: boolean;
  experimentalContractV2Enabled: boolean;
  onActionPress: () => void;
  onToggleCompact: () => void;
  onChannelChange?: (channelId: string) => void;
  onPickerChange?: (pickerLabel: string) => void;
  onPageTypeChange?: (pageTypeId: PageTypeId) => void;
  onShellAuditToggle?: () => void;
  onShowExpectedToggle?: () => void;
  onHideCustomizationsToggle?: () => void;
  onExperimentalContractV2Toggle?: () => void;
  onExampleCapture?: (request: GenerationExampleCaptureRequest) => void;
};

type PickerOption = {
  id: string;
  label: string;
  section: 'Web' | 'АБМ';
  icon: React.ReactNode;
};

type WorkshopOption = {
  id: string;
  label: string;
};

type PageTypeOption = {
  id: PageTypeId;
  label: string;
};

const PAGE_TYPE_OPTIONS: PageTypeOption[] = [
  { id: 'form', label: 'Форма' },
  { id: 'details', label: 'Просмотровая' },
  { id: 'data-list', label: 'Страница с таблицей' },
  { id: 'landing', label: 'Лендинг' },
  { id: 'dashboard', label: 'Дашборд' },
  { id: 'other', label: 'Другое' },
];

const PICKER_OPTIONS: PickerOption[] = [
  {
    id: 'desktop',
    label: 'Desktop',
    section: 'Web',
    icon: <PickerDisplayIcon />,
  },
  {
    id: 'mobile-web',
    label: 'MobileWeb',
    section: 'Web',
    icon: <PickerMobilePhoneIcon />,
  },
  {
    id: 'ios',
    label: 'iOS',
    section: 'АБМ',
    icon: <PickerAppleIcon />,
  },
  {
    id: 'android',
    label: 'Android',
    section: 'АБМ',
    icon: <PickerAndroidIcon />,
  },
];

const WORKSHOP_OPTIONS: WorkshopOption[] = [
  {
    id: 'b2b',
    label: 'b2b',
  },
  {
    id: 'b2c',
    label: 'b2c',
  },
  {
    id: 'site',
    label: 'site',
  },
  {
    id: 'invest',
    label: 'invest',
  },
];

export function TopSection({
  title,
  pageTypeId,
  channelId,
  pickerLabel,
  actionLabel,
  actionDisabled,
  actionLoading,
  actionType,
  compact,
  shellAuditEnabled,
  showExpectedCustomizations,
  hideCustomizations,
  experimentalContractV2Enabled,
  onActionPress,
  onToggleCompact,
  onChannelChange,
  onPickerChange,
  onPageTypeChange,
  onShellAuditToggle,
  onShowExpectedToggle,
  onHideCustomizationsToggle,
  onExperimentalContractV2Toggle,
  onExampleCapture,
}: TopSectionProps): React.JSX.Element {
  const settingsRootRef = useRef<HTMLDivElement | null>(null);
  const pageTypeRootRef = useRef<HTMLDivElement | null>(null);
  const pickerRootRef = useRef<HTMLDivElement | null>(null);
  const workshopRootRef = useRef<HTMLDivElement | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pageTypeOpen, setPageTypeOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [workshopOpen, setWorkshopOpen] = useState(false);
  const [exampleModalOpen, setExampleModalOpen] = useState(false);
  const [selectedPickerLabel, setSelectedPickerLabel] = useState(pickerLabel);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState(
    channelId || WORKSHOP_OPTIONS[0].id,
  );

  useEffect(() => {
    setSelectedPickerLabel(pickerLabel);
  }, [pickerLabel]);

  useEffect(() => {
    setSelectedWorkshopId(channelId || WORKSHOP_OPTIONS[0].id);
  }, [channelId]);

  useEffect(() => {
    if (actionLoading) {
      setSettingsOpen(false);
      setPickerOpen(false);
      setWorkshopOpen(false);
      setExampleModalOpen(false);
    }
  }, [actionLoading]);

  useEffect(() => {
    if (!settingsOpen && !pageTypeOpen && !pickerOpen && !workshopOpen) {
      return undefined;
    }

    function handlePointerDown(event: MouseEvent): void {
      const target = event.target as Node;
      if (!settingsRootRef.current?.contains(target)) {
        setSettingsOpen(false);
      }
      if (!pageTypeRootRef.current?.contains(target)) {
        setPageTypeOpen(false);
      }
      if (!pickerRootRef.current?.contains(target)) {
        setPickerOpen(false);
      }
      if (!workshopRootRef.current?.contains(target)) {
        setWorkshopOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setSettingsOpen(false);
        setPageTypeOpen(false);
        setPickerOpen(false);
        setWorkshopOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [settingsOpen, pageTypeOpen, pickerOpen, workshopOpen]);

  const selectedOption =
    PICKER_OPTIONS.find((option) => option.label === selectedPickerLabel) ??
    PICKER_OPTIONS[0];
  const selectedWorkshop =
    WORKSHOP_OPTIONS.find((option) => option.id === selectedWorkshopId) ??
    WORKSHOP_OPTIONS[0];
  const selectedPageType =
    PAGE_TYPE_OPTIONS.find((option) => option.id === pageTypeId) ?? null;
  const actionKey = [
    selectedOption.label,
    selectedWorkshop.id,
    shellAuditEnabled ? 'shared-on' : 'shared-off',
    showExpectedCustomizations ? 'expected-on' : 'expected-off',
    hideCustomizations ? 'customizations-hidden' : 'customizations-visible',
    experimentalContractV2Enabled ? 'contract-v2-on' : 'contract-v2-off',
    actionType,
    actionLabel,
    actionDisabled ? 'disabled' : 'enabled',
    actionLoading ? 'loading' : 'idle',
    compact ? 'compact' : 'full',
  ].join(':');

  const settingsControl = (
    <div className={styles.settingsWrap} ref={settingsRootRef}>
      <Button
        label="Настройки"
        singleIcon
        type="secondary"
        size={compact ? 'compact' : 'regular'}
        ariaLabel="Открыть настройки Apollo"
        title="Настройки"
        icon={<SettingsIcon />}
        onPress={() => {
          setPageTypeOpen(false);
          setPickerOpen(false);
          setWorkshopOpen(false);
          setSettingsOpen((value) => !value);
        }}
      />
      {settingsOpen ? (
        <div className={styles.settingsPanel} role="dialog" aria-label="Настройки Apollo">
          <div className={styles.settingsField}>
            <div className={styles.settingsLabel}>Канал</div>
            <div className={styles.pickerWrap} ref={workshopRootRef}>
              <PickerButton
                label={selectedWorkshop.label}
                open={workshopOpen}
                disabled={actionLoading}
                onPress={() => {
                  setPickerOpen(false);
                  setWorkshopOpen((value) => !value);
                }}
              />
              {workshopOpen ? (
                <OptionList className={styles.pickerMenu}>
                  {WORKSHOP_OPTIONS.map((option) => (
                    <OptionListCell
                      key={option.id}
                      label={option.label}
                      selected={selectedWorkshop.id === option.id}
                      onPress={() => {
                        setSelectedWorkshopId(option.id);
                        onChannelChange?.(option.id);
                        setWorkshopOpen(false);
                      }}
                    />
                  ))}
                </OptionList>
              ) : null}
            </div>
          </div>
          <div className={styles.settingsField}>
            <div className={styles.settingsLabel}>Платформа</div>
            <div className={styles.pickerWrap} ref={pickerRootRef}>
              <PickerButton
                label={selectedOption.label}
                open={pickerOpen}
                selected
                disabled={actionLoading}
                leadingIcon={selectedOption.icon}
                onPress={() => {
                  setWorkshopOpen(false);
                  setPickerOpen((value) => !value);
                }}
              />
              {pickerOpen ? (
                <OptionList className={styles.pickerMenu}>
                  <OptionListHeader label="Web" />
                  <OptionListCell
                    label="Desktop"
                    selected={selectedOption.id === 'desktop'}
                    leadingIcon={<PickerDisplayIcon />}
                    onPress={() => {
                      setSelectedPickerLabel('Desktop');
                      onPickerChange?.('Desktop');
                      setPickerOpen(false);
                    }}
                  />
                  <OptionListCell
                    label="MobileWeb"
                    selected={selectedOption.id === 'mobile-web'}
                    leadingIcon={<PickerMobilePhoneIcon />}
                    onPress={() => {
                      setSelectedPickerLabel('MobileWeb');
                      onPickerChange?.('MobileWeb');
                      setPickerOpen(false);
                    }}
                  />
                  <OptionListHeader label="АБМ" />
                  <OptionListCell
                    label="iOS"
                    selected={selectedOption.id === 'ios'}
                    leadingIcon={<PickerAppleIcon />}
                    onPress={() => {
                      setSelectedPickerLabel('iOS');
                      onPickerChange?.('iOS');
                      setPickerOpen(false);
                    }}
                  />
                  <OptionListCell
                    label="Android"
                    selected={selectedOption.id === 'android'}
                    leadingIcon={<PickerAndroidIcon />}
                    onPress={() => {
                      setSelectedPickerLabel('Android');
                      onPickerChange?.('Android');
                      setPickerOpen(false);
                    }}
                  />
                </OptionList>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            className={styles.switchRow}
            disabled={actionLoading}
            aria-pressed={shellAuditEnabled}
            onClick={onShellAuditToggle}
          >
            <span className={styles.switchText}>Проверять шаред</span>
            <span className={[styles.switchTrack, shellAuditEnabled ? styles.switchTrackActive : ''].filter(Boolean).join(' ')}>
              <span className={styles.switchThumb} />
            </span>
          </button>
          <button
            type="button"
            className={styles.switchRow}
            disabled={actionLoading}
            aria-pressed={compact}
            onClick={onToggleCompact}
          >
            <span className={styles.switchText}>Компактный вид</span>
            <span
              className={[
                styles.switchTrack,
                compact ? styles.switchTrackActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={styles.switchThumb} />
            </span>
          </button>
          <button
            type="button"
            className={styles.switchRow}
            disabled={actionLoading}
            aria-pressed={experimentalContractV2Enabled}
            onClick={onExperimentalContractV2Toggle}
          >
            <span className={styles.switchText}>Тестировать Contract v2</span>
            <span
              className={[
                styles.switchTrack,
                experimentalContractV2Enabled ? styles.switchTrackActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={styles.switchThumb} />
            </span>
          </button>
          <button
            type="button"
            className={styles.switchRow}
            disabled={actionLoading}
            aria-pressed={showExpectedCustomizations}
            onClick={onShowExpectedToggle}
          >
            <span className={styles.switchText}>Показывать Expected</span>
            <span
              className={[
                styles.switchTrack,
                showExpectedCustomizations ? styles.switchTrackActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={styles.switchThumb} />
            </span>
          </button>
          <button
            type="button"
            className={styles.switchRow}
            disabled={actionLoading}
            aria-pressed={hideCustomizations}
            onClick={onHideCustomizationsToggle}
          >
            <span className={styles.switchText}>Скрыть кастомизации</span>
            <span
              className={[
                styles.switchTrack,
                hideCustomizations ? styles.switchTrackActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={styles.switchThumb} />
            </span>
          </button>
          <div className={styles.settingsDivider} />
          <button
            type="button"
            className={styles.settingsAction}
            disabled={actionLoading}
            onClick={() => {
              setSettingsOpen(false);
              setPickerOpen(false);
              setWorkshopOpen(false);
              setExampleModalOpen(true);
            }}
          >
            <span className={styles.settingsActionTitle}>Подготовить пример</span>
            <span className={styles.settingsActionCaption}>
              Собрать JSON из выделенного макета
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );

  const actionButton = (
    <Button
      key={actionKey}
      label={actionLabel}
      disabled={actionDisabled}
      loading={actionLoading}
      type={actionType}
      size={compact ? 'compact' : 'regular'}
      singleIcon={compact}
      icon={<FlashIcon />}
      onPress={() => {
        setPageTypeOpen(false);
        onActionPress();
      }}
    />
  );

  const pageTypeControl = (
    <div className={styles.pageTypeWrap} ref={pageTypeRootRef}>
      <PickerButton
        label={selectedPageType?.label ?? 'Тип страницы'}
        open={pageTypeOpen}
        disabled={actionLoading && actionLabel === 'Остановить'}
        className={[
          styles.pageTypeButton,
          selectedPageType ? styles.pageTypeButtonSelected : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onPress={() => {
          setSettingsOpen(false);
          setPickerOpen(false);
          setWorkshopOpen(false);
          setPageTypeOpen((value) => !value);
        }}
      />
      {pageTypeOpen ? (
        <OptionList className={styles.pageTypeMenu}>
          {PAGE_TYPE_OPTIONS.map((option) => (
            <OptionListCell
              key={option.id}
              label={option.label}
              selected={pageTypeId === option.id}
              showLeadingIcon={false}
              onPress={() => {
                onPageTypeChange?.(option.id);
                setPageTypeOpen(false);
              }}
            />
          ))}
        </OptionList>
      ) : null}
    </div>
  );

  return (
    <>
      <div
        className={[styles.root, compact ? styles.rootCompact : '']
          .filter(Boolean)
          .join(' ')}
        data-product={title}
      >
        {pageTypeControl}
        <div className={compact ? styles.compactRightSide : styles.rightSide}>
          {settingsControl}
          {actionButton}
        </div>
      </div>
      {exampleModalOpen ? (
        <GenerationExampleModal
          initialPlatform={
            toGenerationExamplePlatform(selectedOption.id)
          }
          disabled={actionLoading}
          onClose={() => setExampleModalOpen(false)}
          onSubmit={(request) => onExampleCapture?.(request)}
        />
      ) : null}
    </>
  );
}

function toGenerationExamplePlatform(
  pickerId: string,
): GenerationExampleCaptureRequest['platform'] {
  if (pickerId === 'mobile-web') return 'mobile-web';
  if (pickerId === 'ios') return 'ios';
  if (pickerId === 'android') return 'android';
  return 'desktop';
}
