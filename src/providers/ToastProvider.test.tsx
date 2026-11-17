import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast } from './ToastProvider'

function Trigger() {
  const toast = useToast()
  return (
    <button type="button" onClick={() => ['uno', 'dos', 'tres', 'cuatro'].forEach((t) => toast.info(t))}>
      lanzar
    </button>
  )
}

describe('ToastProvider', () => {
  it('shows at most 3 toasts and promotes queued ones in FIFO order', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    )
    await user.click(screen.getByText('lanzar'))
    expect(screen.getByText('uno')).toBeInTheDocument()
    expect(screen.getByText('tres')).toBeInTheDocument()
    expect(screen.queryByText('cuatro')).not.toBeInTheDocument()

    await act(async () => {
      await user.click(screen.getAllByLabelText('Cerrar notificación')[0] as HTMLElement)
    })
    expect(await screen.findByText('cuatro')).toBeInTheDocument()
  })
})
