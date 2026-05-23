import { useTheme } from '../../context/ThemeContext';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { isDark } = useTheme();

  return (
    <Sonner
      theme={isDark ? 'dark' : 'light'}
      className="toaster group"
      {...props}
    />
  );
};

export { Toaster };
