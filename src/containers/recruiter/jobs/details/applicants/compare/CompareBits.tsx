import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useLayoutEffect, useRef, useState } from 'react';
import type { IconType } from 'react-icons';
import { MdEmojiEvents, MdExpandMore } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { ACCENT_COLORS } from '@/styles/themes/accents';

/** Small trophy next to the value that leads the group, with the reason in a tooltip. */
export function LeaderMark({ label }: { label: string }) {
  return (
    <Tooltip title={label}>
      <Box
        component="span"
        role="img"
        aria-label={label}
        tabIndex={0}
        className="inline-flex shrink-0"
        sx={{ color: ACCENT_COLORS.amber }}
      >
        <MdEmojiEvents size={18} />
      </Box>
    </Tooltip>
  );
}

type CompareSectionTitleProps = {
  icon: IconType;
  title: string;
  open: boolean;
  onToggle: () => void;
};

/** Section heading that stays at the start edge while the columns scroll sideways. */
export function CompareSectionTitle({ icon, title, open, onToggle }: CompareSectionTitleProps) {
  return (
    <ButtonBase
      onClick={onToggle}
      aria-expanded={open}
      className="sticky start-3 flex w-fit items-center gap-2.5 rounded-xl py-1 pe-2 ps-1"
      sx={{ '&:hover': { bgcolor: 'action.hover' } }}
    >
      <IconTile icon={icon} size="sm" />
      <Typography variant="h5" component="h3">
        {title}
      </Typography>
      <Box
        component={MdExpandMore}
        size={22}
        sx={{ color: 'text.secondary', transition: 'transform 0.2s', transform: open ? 'none' : 'rotate(-90deg)' }}
      />
    </ButtonBase>
  );
}

type ExpandableTextProps = {
  text: string;
  lines: number;
};

/** Text clamped to a few lines, with a "Read more" toggle only when something is actually hidden. */
export function ExpandableText({ text, lines }: ExpandableTextProps) {
  const { $t } = useIntl();
  const ref = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);

  useLayoutEffect(() => {
    const element = ref.current;
    if (element && !expanded) setClamped(element.scrollHeight > element.clientHeight + 1);
  }, [text, expanded, lines]);

  return (
    <Box>
      <Typography
        ref={ref}
        variant="body2"
        className="whitespace-pre-line break-words"
        sx={
          expanded
            ? undefined
            : { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: lines, overflow: 'hidden' }
        }
      >
        {text}
      </Typography>
      {(clamped || expanded) && (
        <Button size="small" onClick={() => setExpanded((value) => !value)} className="-ms-1 mt-0.5 px-1">
          {$t({ id: expanded ? 'compare.readLess' : 'compare.readMore' })}
        </Button>
      )}
    </Box>
  );
}
