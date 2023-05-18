namespace Wyan;

public interface IClickablePanelProvider
{
    Task<IEnumerable<ClickablePanel>> GetPanels();
}
